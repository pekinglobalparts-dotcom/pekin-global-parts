import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimitDb, clearRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["admin", "socio"]),
});

// Límites anti fuerza bruta en el login.
// - Por cuenta (email+rol): frena adivinar la contraseña de un usuario puntual.
// - Por IP: frena el "spraying" (probar muchas cuentas desde una misma IP).
const LOGIN_MAX_POR_CUENTA = 8;
const LOGIN_VENTANA_CUENTA_MS = 15 * 60_000; // 15 minutos
const LOGIN_MAX_POR_IP = 30;
const LOGIN_VENTANA_IP_MS = 10 * 60_000; // 10 minutos

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, role } = parsed.data;

        // ── Protección anti fuerza bruta ──────────────────────────────
        // Contamos cada intento por IP y por cuenta. Si se supera el límite,
        // rechazamos ANTES de comparar la contraseña. Al iniciar sesión con
        // éxito, limpiamos ambos contadores.
        const ip = getRateLimitIdentifier(request as Request);
        const cuentaKey = `login:cuenta:${role}:${email.toLowerCase()}`;
        const ipKey = `login:ip:${ip}`;

        const [porCuenta, porIp] = await Promise.all([
          rateLimitDb(cuentaKey, LOGIN_MAX_POR_CUENTA, LOGIN_VENTANA_CUENTA_MS),
          rateLimitDb(ipKey, LOGIN_MAX_POR_IP, LOGIN_VENTANA_IP_MS),
        ]);
        if (!porCuenta.success || !porIp.success) {
          // Demasiados intentos: bloqueamos temporalmente sin revelar detalles.
          return null;
        }
        // ──────────────────────────────────────────────────────────────

        if (role === "admin") {
          const admin = await prisma.administrador.findUnique({
            where: { email },
          });
          if (!admin || !admin.activo) return null;
          const valid = await bcrypt.compare(password, admin.passwordHash);
          if (!valid) return null;
          // Login correcto: reiniciamos los contadores de intentos.
          await Promise.all([clearRateLimit(cuentaKey), clearRateLimit(ipKey)]);
          return {
            id: admin.id,
            email: admin.email,
            name: `${admin.nombre} ${admin.apellido}`,
            role: "admin",
            adminRole: admin.role,
          };
        }

        if (role === "socio") {
          const socio = await prisma.socio.findFirst({
            where: {
              OR: [{ ruc: email }, { emailCorporativo: email }],
            },
          });
          if (!socio || socio.status !== "ACTIVO") return null;
          const valid = await bcrypt.compare(password, socio.passwordHash);
          if (!valid) return null;
          // Login correcto: reiniciamos los contadores de intentos.
          await Promise.all([clearRateLimit(cuentaKey), clearRateLimit(ipKey)]);
          // Registrar el último acceso del socio (no bloquea el login si falla)
          prisma.socio
            .update({ where: { id: socio.id }, data: { ultimoAcceso: new Date() } })
            .catch(() => {});
          return {
            id: socio.id,
            email: socio.emailCorporativo,
            name: socio.razonSocial,
            role: "socio",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.adminRole = (user as { adminRole?: string }).adminRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.adminRole = token.adminRole as string | undefined;
      }
      return session;
    },
  },
});
