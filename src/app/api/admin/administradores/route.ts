import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).default("ADMIN"),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admins = await prisma.administrador.findMany({
    select: { id: true, nombre: true, apellido: true, email: true, role: true, activo: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { nombre, apellido, email, password, role } = parsed.data;

  const exists = await prisma.administrador.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.administrador.create({
    data: { nombre, apellido, email, passwordHash, role },
    select: { id: true, nombre: true, apellido: true, email: true, role: true, activo: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}
