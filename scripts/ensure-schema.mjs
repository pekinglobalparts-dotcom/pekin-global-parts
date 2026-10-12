// Sincronización de esquema segura e idempotente para el deploy.
//
// En vez de `prisma db push` (que compara TODO el esquema y puede negarse
// o intentar borrar columnas si detecta diferencias), este script solo
// AGREGA las columnas nuevas si aún no existen. Nunca borra ni modifica
// datos. Es seguro correrlo en cada despliegue.
//
// Para agregar más columnas en el futuro, añade otra línea ALTER ... IF NOT EXISTS.

import "dotenv/config";
import pg from "pg";

const STATEMENTS = [
  `ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "ocUrl" TEXT;`,
  `ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "ocNumero" TEXT;`,
  `ALTER TABLE "socios" ADD COLUMN IF NOT EXISTS "ultimoAcceso" TIMESTAMP(3);`,
  `ALTER TABLE "socios" ADD COLUMN IF NOT EXISTS "passwordCambiado" BOOLEAN NOT NULL DEFAULT false;`,
  `ALTER TABLE "pedido_items" ADD COLUMN IF NOT EXISTS "costoUnit" DECIMAL(10,2);`,
  `CREATE TABLE IF NOT EXISTS "ventas_mostrador" (
     "id" TEXT PRIMARY KEY,
     "numero" TEXT NOT NULL UNIQUE,
     "cliente" TEXT,
     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "total" DECIMAL(12,2) NOT NULL,
     "costoTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
     "ganancia" DECIMAL(12,2) NOT NULL DEFAULT 0,
     "items" JSONB NOT NULL,
     "notas" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  `CREATE TABLE IF NOT EXISTS "gastos" (
     "id" TEXT PRIMARY KEY,
     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "categoria" TEXT NOT NULL,
     "monto" DECIMAL(12,2) NOT NULL,
     "descripcion" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  `ALTER TABLE "ventas_mostrador" ADD COLUMN IF NOT EXISTS "docCliente" TEXT;`,
  `ALTER TABLE "ventas_mostrador" ADD COLUMN IF NOT EXISTS "modalidad" TEXT NOT NULL DEFAULT 'CONTADO';`,
  `CREATE TABLE IF NOT EXISTS "productos_tienda" (
     "id" TEXT PRIMARY KEY,
     "codigo" TEXT NOT NULL UNIQUE,
     "descripcion" TEXT NOT NULL,
     "precio" DECIMAL(10,2) NOT NULL,
     "costo" DECIMAL(10,2),
     "stock" INTEGER NOT NULL DEFAULT 0,
     "stockMinimo" INTEGER NOT NULL DEFAULT 0,
     "activo" BOOLEAN NOT NULL DEFAULT true,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  // Limitador de peticiones persistente (anti fuerza bruta / anti spam).
  `CREATE TABLE IF NOT EXISTS "rate_limits" (
     "key" TEXT PRIMARY KEY,
     "count" INTEGER NOT NULL DEFAULT 0,
     "reset_at" TIMESTAMP(3) NOT NULL
   );`,
  `CREATE INDEX IF NOT EXISTS "rate_limits_reset_at_idx" ON "rate_limits" ("reset_at");`,
  // Expiración del enlace de subida de documentos.
  `ALTER TABLE "solicitudes" ADD COLUMN IF NOT EXISTS "tokenDocumentosExpira" TIMESTAMP(3);`,
  // Correos adicionales (CC) para recordatorios de cobranza por socio.
  `ALTER TABLE "socios" ADD COLUMN IF NOT EXISTS "correosCobranza" TEXT;`,
  // Marca de tiempo del último recordatorio de pago enviado.
  `ALTER TABLE "facturas" ADD COLUMN IF NOT EXISTS "ultimoRecordatorio" TIMESTAMP(3);`,
  // Vitrina / catálogo público con foto y precio (crece poco a poco).
  `CREATE TABLE IF NOT EXISTS "productos_vitrina" (
     "id" TEXT PRIMARY KEY,
     "codigo" TEXT,
     "descripcion" TEXT NOT NULL,
     "marca" TEXT,
     "modelo" TEXT,
     "imagenUrl" TEXT,
     "precioSocio" DECIMAL(10,2) NOT NULL,
     "precioPublico" DECIMAL(10,2) NOT NULL,
     "activo" BOOLEAN NOT NULL DEFAULT true,
     "destacado" BOOLEAN NOT NULL DEFAULT false,
     "orden" INTEGER NOT NULL DEFAULT 0,
     "origen" TEXT,
     "origenId" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  `CREATE INDEX IF NOT EXISTS "productos_vitrina_activo_idx" ON "productos_vitrina" ("activo");`,
  // Marca si la foto del producto ya tiene el sello de agua grabado.
  `ALTER TABLE "productos_vitrina" ADD COLUMN IF NOT EXISTS "fotoSellada" BOOLEAN NOT NULL DEFAULT false;`,
  // Versión del sello de agua aplicado (para re-sellar si cambia el diseño).
  `ALTER TABLE "productos_vitrina" ADD COLUMN IF NOT EXISTS "selloVersion" INTEGER NOT NULL DEFAULT 0;`,
  // Disponibilidad del producto (en stock / sin stock).
  `ALTER TABLE "productos_vitrina" ADD COLUMN IF NOT EXISTS "enStock" BOOLEAN NOT NULL DEFAULT true;`,
  // CRM: prospectos (embudo de ventas) y seguimientos.
  `CREATE TABLE IF NOT EXISTS "prospectos" (
     "id" TEXT PRIMARY KEY,
     "nombre" TEXT NOT NULL,
     "telefono" TEXT,
     "empresa" TEXT,
     "origen" TEXT NOT NULL DEFAULT 'WHATSAPP',
     "interes" TEXT,
     "etapa" TEXT NOT NULL DEFAULT 'NUEVO',
     "valorEstimado" DECIMAL(12,2),
     "notas" TEXT,
     "socioId" TEXT,
     "orden" INTEGER NOT NULL DEFAULT 0,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  `CREATE INDEX IF NOT EXISTS "prospectos_etapa_idx" ON "prospectos" ("etapa");`,
  `CREATE TABLE IF NOT EXISTS "seguimientos_crm" (
     "id" TEXT PRIMARY KEY,
     "prospectoId" TEXT,
     "titulo" TEXT NOT NULL,
     "fecha" TIMESTAMP(3) NOT NULL,
     "hecho" BOOLEAN NOT NULL DEFAULT false,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  `CREATE INDEX IF NOT EXISTS "seguimientos_crm_fecha_idx" ON "seguimientos_crm" ("fecha");`,
  // CRM automatizado: estado de las acciones sugeridas (enviada / descartada / pospuesta)
  // para no volver a sugerir lo mismo. "clave" es determinista por tipo + referencia.
  `CREATE TABLE IF NOT EXISTS "acciones_crm" (
     "id" TEXT PRIMARY KEY,
     "clave" TEXT NOT NULL UNIQUE,
     "tipo" TEXT NOT NULL,
     "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
     "canal" TEXT,
     "snoozeHasta" TIMESTAMP(3),
     "nota" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );`,
  `CREATE INDEX IF NOT EXISTS "acciones_crm_estado_idx" ON "acciones_crm" ("estado");`,
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[ensure-schema] Falta DATABASE_URL; se omite la sincronización.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    for (const sql of STATEMENTS) {
      await client.query(sql);
    }
    console.log(`[ensure-schema] OK — ${STATEMENTS.length} columna(s) verificada(s).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[ensure-schema] Error sincronizando el esquema:", err);
  process.exit(1);
});
