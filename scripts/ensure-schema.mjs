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
