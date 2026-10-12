import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAcciones } from "@/lib/crm";

// Bandeja de acciones sugeridas: el motor las genera en vivo desde los datos.
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const acciones = await getAcciones();
  return NextResponse.json({ acciones });
}
