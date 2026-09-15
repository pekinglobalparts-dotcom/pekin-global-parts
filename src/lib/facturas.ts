import { prisma } from "@/lib/prisma";

// Marca como VENCIDA toda factura PENDIENTE cuya fecha de vencimiento ya pasó.
//
// El sistema no tiene un proceso programado (cron), así que hacemos esta
// actualización "perezosa" cada vez que se listan las facturas: es una sola
// consulta, idempotente y barata. Así el estado siempre refleja la realidad
// sin depender de que alguien lo cambie a mano.
//
// Nota: nunca se marca PAGADA automáticamente — eso solo lo sabe el dueño y se
// hace con el botón "Marcar pagada".
export async function marcarFacturasVencidas(): Promise<void> {
  try {
    await prisma.factura.updateMany({
      where: { status: "PENDIENTE", fechaVencimiento: { lt: new Date() } },
      data: { status: "VENCIDA" },
    });
  } catch (e) {
    console.error("[facturas] No se pudo marcar vencidas:", e);
  }
}
