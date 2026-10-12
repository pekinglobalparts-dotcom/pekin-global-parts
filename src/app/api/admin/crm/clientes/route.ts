import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientes } from "@/lib/crm";

// Ficha de clientes del CRM: se arma sola desde los socios y su historial real.
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clientes = await getClientes();
  return NextResponse.json({ clientes });
}
