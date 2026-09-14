import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";

// Restablecer la contraseña de un socio — solo Super Admin (el dueño).
//
// Las contraseñas se guardan encriptadas (bcrypt) y NO se pueden recuperar.
// Cuando el dueño necesita reponer el acceso de un socio (p. ej. perdió la
// clave), genera una NUEVA contraseña temporal que se muestra UNA sola vez
// aquí para entregársela; el socio la cambia al ingresar.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin" || session.user.adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: solo SUPER_ADMIN puede restablecer contraseñas" }, { status: 403 });
  }

  const { id } = await params;
  const socio = await prisma.socio.findUnique({
    where: { id },
    select: { id: true, razonSocial: true, ruc: true, emailCorporativo: true },
  });
  if (!socio) return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 });

  const nuevaPassword = generatePassword();
  const passwordHash = await bcrypt.hash(nuevaPassword, 12);

  await prisma.socio.update({
    where: { id },
    data: { passwordHash, passwordCambiado: false },
  });

  await prisma.auditLog.create({
    data: {
      administradorId: session.user.id,
      accion: "RESET_PASSWORD_SOCIO",
      entidad: "Socio",
      entidadId: id,
      // Nunca guardamos la contraseña, solo el hecho de que se restableció.
      datosDespues: { razonSocial: socio.razonSocial, ruc: socio.ruc },
    },
  });

  return NextResponse.json({
    ok: true,
    password: nuevaPassword,
    usuario: socio.emailCorporativo,
    ruc: socio.ruc,
    razonSocial: socio.razonSocial,
  });
}
