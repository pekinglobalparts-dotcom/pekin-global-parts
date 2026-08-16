import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tablero financiero — solo Super Admin.
// Convención: todos los montos se manejan SIN IGV (valor real de venta y costo).

type VMItem = { descripcion: string; codigo?: string | null; cantidad: number; precioUnit: number; costoUnit: number };

const num = (v: unknown) => Number(v ?? 0);
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth() - 5, 1); // ventana de 6 meses
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pedidos, ventas, facturas] = await Promise.all([
    prisma.pedido.findMany({
      where: { status: "ENTREGADO", createdAt: { gte: desde } },
      select: { id: true, subtotal: true, createdAt: true, items: true },
    }),
    prisma.ventaMostrador.findMany({
      where: { fecha: { gte: desde } },
    }),
    prisma.factura.findMany({
      select: { total: true, status: true, pagadoAt: true },
    }),
  ]);

  // Acumuladores por mes (últimos 6 meses)
  const meses: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    meses.push(monthKey(d));
  }
  const serie: Record<string, { ventas: number; ganancia: number }> = {};
  meses.forEach(m => (serie[m] = { ventas: 0, ganancia: 0 }));

  // Ranking de productos (por descripción normalizada)
  const ranking = new Map<string, { nombre: string; cantidad: number; venta: number }>();
  const addRanking = (nombre: string, cantidad: number, venta: number) => {
    const key = nombre.trim().toLowerCase();
    if (!key) return;
    const r = ranking.get(key) || { nombre: nombre.trim(), cantidad: 0, venta: 0 };
    r.cantidad += cantidad;
    r.venta += venta;
    ranking.set(key, r);
  };

  let ventasMes = 0;
  let gananciaMes = 0;
  let pedidosSinCosto = 0;

  // --- Pedidos de socios (entregados) ---
  for (const p of pedidos) {
    const venta = num(p.subtotal); // sin IGV
    const items = (p.items as unknown as { descripcion?: string | null; cantidad: number; costoUnit?: unknown; precioUnit: unknown }[]) || [];
    const costo = items.reduce((s, it) => s + num(it.costoUnit) * it.cantidad, 0);
    const tieneCosto = items.some(it => it.costoUnit != null && num(it.costoUnit) > 0);
    const ganancia = tieneCosto ? venta - costo : 0;

    const mk = monthKey(new Date(p.createdAt));
    if (serie[mk]) {
      serie[mk].ventas += venta;
      serie[mk].ganancia += ganancia;
    }
    if (new Date(p.createdAt) >= inicioMes) {
      ventasMes += venta;
      gananciaMes += ganancia;
      if (!tieneCosto) pedidosSinCosto++;
    }
    // ranking: reparte venta del pedido entre sus líneas por proporción de subtotal
    const totalLineas = items.reduce((s, it) => s + num(it.precioUnit) * it.cantidad, 0) || 1;
    for (const it of items) {
      const ventaLinea = venta * ((num(it.precioUnit) * it.cantidad) / totalLineas);
      addRanking(it.descripcion || "Repuesto", it.cantidad, ventaLinea);
    }
  }

  // --- Ventas de mostrador ---
  for (const v of ventas) {
    const venta = num(v.total);
    const ganancia = num(v.ganancia);
    const mk = monthKey(new Date(v.fecha));
    if (serie[mk]) {
      serie[mk].ventas += venta;
      serie[mk].ganancia += ganancia;
    }
    if (new Date(v.fecha) >= inicioMes) {
      ventasMes += venta;
      gananciaMes += ganancia;
    }
    const items = (v.items as unknown as VMItem[]) || [];
    for (const it of items) {
      addRanking(it.descripcion || "Repuesto", num(it.cantidad), num(it.precioUnit) * num(it.cantidad));
    }
  }

  // --- Cobros y deudas (facturas) ---
  let porCobrar = 0;
  let cobradoMes = 0;
  for (const f of facturas) {
    if (f.status === "PENDIENTE" || f.status === "VENCIDA") porCobrar += num(f.total);
    if (f.status === "PAGADA" && f.pagadoAt && new Date(f.pagadoAt) >= inicioMes) cobradoMes += num(f.total);
  }

  const topProductos = Array.from(ranking.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  const margenMes = ventasMes > 0 ? (gananciaMes / ventasMes) * 100 : 0;

  return NextResponse.json({
    mes: {
      ventas: ventasMes,
      ganancia: gananciaMes,
      margen: margenMes,
      pedidosSinCosto,
    },
    cobros: { porCobrar, cobradoMes },
    serie: meses.map(m => ({ mes: m, ...serie[m] })),
    topProductos,
  });
}
