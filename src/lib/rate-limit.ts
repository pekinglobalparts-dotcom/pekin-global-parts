import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
// Limitador de peticiones PERSISTENTE (respaldado en la base de datos).
//
// Antes usábamos un Map en memoria, que en Vercel (serverless) es inútil:
// cada instancia tiene su propia memoria y se reinicia sola, así que un
// atacante lo evadía con facilidad. Esta versión guarda el contador en la
// tabla "rate_limits" con un UPSERT atómico, por lo que el límite se respeta
// aunque haya muchas instancias del servidor al mismo tiempo.
//
// La tabla se crea sola en el deploy (ver scripts/ensure-schema.mjs).
// ─────────────────────────────────────────────────────────────

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Cuenta un intento para `key` y dice si superó el límite dentro de la ventana.
 * Es atómico: incrementa y devuelve el conteo en una sola consulta.
 */
export async function rateLimitDb(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const reset = new Date(Date.now() + windowMs);
  try {
    const rows = await prisma.$queryRaw<{ count: number; reset_at: Date }[]>`
      INSERT INTO "rate_limits" ("key", "count", "reset_at")
      VALUES (${key}, 1, ${reset})
      ON CONFLICT ("key") DO UPDATE SET
        "count"    = CASE WHEN "rate_limits"."reset_at" < now() THEN 1 ELSE "rate_limits"."count" + 1 END,
        "reset_at" = CASE WHEN "rate_limits"."reset_at" < now() THEN ${reset} ELSE "rate_limits"."reset_at" END
      RETURNING "count", "reset_at";
    `;
    const row = rows[0];
    const count = Number(row.count);
    const resetAt = new Date(row.reset_at).getTime();
    if (count > limit) {
      return { success: false, remaining: 0, retryAfterMs: Math.max(0, resetAt - Date.now()) };
    }
    return { success: true, remaining: limit - count, retryAfterMs: 0 };
  } catch (e) {
    // Si la BD falla, no tumbamos el tráfico legítimo (fail-open) pero lo dejamos registrado.
    console.error("[rate-limit-db] error", e);
    return { success: true, remaining: limit, retryAfterMs: 0 };
  }
}

/** Reinicia el contador de una clave (p. ej. tras un login exitoso). */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await prisma.$executeRaw`DELETE FROM "rate_limits" WHERE "key" = ${key}`;
  } catch (e) {
    console.error("[rate-limit-db] clear error", e);
  }
}

/** Extrae la IP del cliente desde las cabeceras del proxy (Vercel). */
export function getRateLimitIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : "unknown";
}

// ─────────────────────────────────────────────────────────────
// Compatibilidad: versión síncrona en memoria (se mantiene por si algún
// código antiguo la usa). Prefiere `rateLimitDb` en rutas nuevas.
// ─────────────────────────────────────────────────────────────
const rateMap = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(identifier);

  if (!entry || entry.reset < now) {
    rateMap.set(identifier, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
