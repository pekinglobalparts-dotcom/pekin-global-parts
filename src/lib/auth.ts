import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["admin", "socio"]),
});

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
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, role } = parsed.data;

        if (role === "admin") {
          const admin = await prisma.administrador.findUnique({
            where: { email },
          });
          if (!admin || !admin.activo) return null;
          const valid = await bcrypt.compare(password, admin.passwordHash);
          if (!valid) return null;
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
