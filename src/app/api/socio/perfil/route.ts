import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const socio = await prisma.socio.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      razonSocial: true,
      ruc: true,
      emailCorporativo: true,
      telefono: true,
      sector: true,
      representanteLegal: true,
      cargo: true,
      direccion: true,
      ciudad: true,
      logoUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ socio });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "socio") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { telefono, direccion, ciudad, logoUrl, currentPassword, newPassword } = body;

  const updateData: Record<string, unknown> = {};
  if (telefono) updateData.telefono = telefono;
  if (direccion !== undefined) updateData.direccion = direccion;
  if (ciudad !== undefined) updateData.ciudad = ciudad;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

  if (newPassword) {
    const socio = await prisma.socio.findUnique({ where: { id: session.user.id } });
    if (!socio) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, socio.passwordHash);
    if (!valid) return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 });
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    updateData.passwordCambiado = true;
  }

  const socio = await prisma.socio.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, razonSocial: true, telefono: true, direccion: true, ciudad: true },
  });

  return NextResponse.json({ socio });
}
