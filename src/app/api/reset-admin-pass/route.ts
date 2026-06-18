import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "pekin-import-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.admin.update({
    where: { email: "pekinglobalparts@gmail.com" },
    data: { password: "$2b$12$XVxLrUafcoTJnfsV7IBCGuJDW5EPv/FpYSRP4z5MBPO5.yPkA9uYC" },
  });

  return NextResponse.json({ ok: true, msg: "Contraseña actualizada" });
}
