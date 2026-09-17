import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  actual: z.string().min(1),
  nueva: z.string().min(8),
});

// Cambio de contraseña de la PROPIA cuenta del administrador en sesión.
// Requiere la contraseña actual (evita que un token/sesión abierta cambie la
// clave sin conocerla). Es seguro para uno mismo, a diferencia de eliminar o
// desactivar la propia cuenta, que sí quedan bloqueados.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const { actual, nueva } = parsed.data;

  const admin = await prisma.administrador.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!admin) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const ok = await bcrypt.compare(actual, admin.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "La contraseña actual no es correcta." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(nueva, 12);
  await prisma.administrador.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
