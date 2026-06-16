import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET || "pekin-import-2026";

const productos = [
  { codigo: "BYD-473QE", nombre: "Kit de Embrague BYD F3 / F3R 1.5L Sedán Taxi MED:200/20D", modelos: ["BYD F3", "BYD F3R 1.5L"], precio: 272.64, imagenUrl: "/productos/emb-BYD-473QE.jpg" },
  { codigo: "CHG-473Q4", nombre: "Kit de Embrague Changan Alsvin Sedán MED:200/20D", modelos: ["Changan Alsvin"], precio: 330.4, imagenUrl: "/productos/emb-CHG-473Q4.jpg" },
  { codigo: "CHG-JL476ZQCD", nombre: "Kit de Embrague Changan CS55 Turbo MED:240/14D", modelos: ["Changan CS55 Turbo"], precio: 515.86, imagenUrl: "/productos/emb-CHG-JL476ZQCD.jpg" },
  { codigo: "CHG-4G18", nombre: "Kit de Embrague Changan CX70 1.6L SUV MED:210/20D", modelos: ["Changan CX70 1.6L"], precio: 404.45, imagenUrl: "/productos/emb-CHG-4G18.jpg" },
  { codigo: "CHG-473QG", nombre: "Kit de Embrague Changan Honor 1.5L MED:210/20D", modelos: ["Changan Honor 1.5L"], precio: 419.24, imagenUrl: "/productos/emb-CHG-473QG.jpg" },
  { codigo: "CHG-JL473Q", nombre: "Kit de Embrague Changan New Van 1.2L MED:200/20D", modelos: ["Changan New Van 1.2L"], precio: 261.46, imagenUrl: "/productos/emb-CHG-JL473Q.jpg" },
  { codigo: "CH-VAN-LHQTJ", nombre: "Kit de Embrague Changan Super Van 1.5L MED:210/20D", modelos: ["Changan Super Van 1.5L"], precio: 323.05, imagenUrl: "/productos/emb-CH-VAN-LHQTJ.jpg" },
  { codigo: "CHG-GRAND-VAN", nombre: "Kit de Embrague Changan Grand Van Turismo MED:200/20D", modelos: ["Changan Grand Van Turismo"], precio: 297.63, imagenUrl: "/productos/emb-CHG-GRAND-VAN.jpg" },
  { codigo: "CHY-RD4G15B", nombre: "Kit de Embrague Chery Tiggo 2 1.5L MED:210/20D", modelos: ["Chery Tiggo 2 1.5L"], precio: 520.8, imagenUrl: "/productos/emb-CHY-RD4G15B.jpg" },
  { codigo: "SKCN300", nombre: "Kit de Embrague Chevrolet N300 Ø188/18D", modelos: ["Chevrolet N300"], precio: 264.6, imagenUrl: "/productos/emb-SKCN300.jpg" },
  { codigo: "SKCN400", nombre: "Kit de Embrague Chevrolet N400 1.5 MED:215/24D", modelos: ["Chevrolet N400 1.5"], precio: 376.6, imagenUrl: "/productos/emb-SKCN400.jpg" },
  { codigo: "SCHR002", nombre: "Kit de Embrague Chevrolet New Sail 1.5 MED:215/24D", modelos: ["Chevrolet New Sail 1.5"], precio: 366.66, imagenUrl: "/productos/emb-SCHR002.jpg" },
  { codigo: "DFM-DK15", nombre: "Kit de Embrague DFSK Glory 330/370/C37 1.5L MED:215/24D", modelos: ["DFSK Glory 330", "DFSK Glory 370", "DFSK C37 1.5L"], precio: 299.61, imagenUrl: "/productos/emb-DFM-DK15.jpg" },
  { codigo: "SFG15A", nombre: "Kit de Embrague DFSK Glory 500 1.5 MED:210/17D", modelos: ["DFSK Glory 500 1.5"], precio: 456.33, imagenUrl: "/productos/emb-SFG15A.jpg" },
  { codigo: "DFM-580-560", nombre: "Kit de Embrague DFSK Glory 580/560 1.8L SUV MED:220/20D", modelos: ["DFSK Glory 580 1.8L", "DFSK Glory 560 1.8L"], precio: 302.36, imagenUrl: "/productos/emb-DFM-580-560.jpg" },
  { codigo: "DFM-580-1.5", nombre: "Kit de Embrague DFSK Glory 580 1.5 Collarín Hidráulico Ø228/14D", modelos: ["DFSK Glory 580 1.5"], precio: 578.2, imagenUrl: "/productos/emb-DFM-580-1.5.jpg" },
  { codigo: "DFM-DK12", nombre: "Kit de Embrague DFSK Glory K07 Van 1.2L MED:188/18D", modelos: ["DFSK Glory K07 1.2L"], precio: 226.69, imagenUrl: "/productos/emb-DFM-DK12.jpg" },
  { codigo: "DFM-A92", nombre: "Kit de Embrague Dongfeng SX5/SX6/X5/X3 1.6L Sedán MED:215/17D", modelos: ["Dongfeng SX5 1.6L", "Dongfeng SX6 1.6L", "Dongfeng X5 1.6L", "Dongfeng X3 1.6L"], precio: 325.21, imagenUrl: "/productos/emb-DFM-A92.jpg" },
  { codigo: "GEELY-4G15", nombre: "Kit de Embrague Geely GX3 1.5L 2016-2020 SUV MED:200/20D", modelos: ["Geely GX3 1.5L 2016", "Geely GX3 1.5L 2020"], precio: 373.79, imagenUrl: "/productos/emb-GEELY-4G15.jpg" },
  { codigo: "GW-4D20M", nombre: "Kit de Embrague Great Wall Poer Pick Up 2.0L Diésel MED:265/24D", modelos: ["Great Wall Poer 2.0D"], precio: 732.2, imagenUrl: "/productos/emb-GW-4D20M.jpg" },
  { codigo: "GW-4G15", nombre: "Kit de Embrague Great Wall Voleex C30 Sedán Taxi MED:212/21D", modelos: ["Great Wall Voleex C30"], precio: 325.61, imagenUrl: "/productos/emb-GW-4G15.jpg" },
  { codigo: "GW-491Q", nombre: "Kit de Embrague Great Wall Wingle 5 2.2L Pick Up Ø235/21D", modelos: ["Great Wall Wingle 5 2.2L"], precio: 424.2, imagenUrl: "/productos/emb-GW-491Q.jpg" },
  { codigo: "GW.4D20", nombre: "Kit de Embrague Great Wall Wingle 7 2.0L / Haval H5-H3 Ø250/24D", modelos: ["Great Wall Wingle 7 2.0L", "Haval H5", "Haval H3"], precio: 533.41, imagenUrl: "/productos/emb-GW.4D20.jpg" },
  { codigo: "GW-4G15K", nombre: "Kit de Embrague Haval Jolion MED:235/23D", modelos: ["Haval Jolion"], precio: 481.63, imagenUrl: "/productos/emb-GW-4G15K.jpg" },
  { codigo: "JAC-4GA", nombre: "Kit de Embrague JAC Refine M1 2005-2012 Van MED:240/23D", modelos: ["JAC Refine M1 2005", "JAC Refine M1 2012"], precio: 373.79, imagenUrl: "/productos/emb-JAC-4GA.jpg" },
  { codigo: "JAC-481Q", nombre: "Kit de Embrague JAC Refine M4 2016-UP Van MED:230/23D", modelos: ["JAC Refine M4 2016"], precio: 413.24, imagenUrl: "/productos/emb-JAC-481Q.jpg" },
  { codigo: "JAC-4GB", nombre: "Kit de Embrague JAC S2/S3 SUV MED:215/20D", modelos: ["JAC S2", "JAC S3"], precio: 333.72, imagenUrl: "/productos/emb-JAC-4GB.jpg" },
  { codigo: "JAC-4DA1.1D", nombre: "Kit de Embrague JAC T6 Pick Up Gasolinero / Jinbei F50 Ø250/23D", modelos: ["JAC T6 Pick Up", "Jinbei F50"], precio: 736.4, imagenUrl: "/productos/emb-JAC-4DA1.1D.jpg" },
  { codigo: "JAC-4DB2", nombre: "Kit de Embrague JAC T6/T8 2.0L CTI Motor 4DB2 Pick Up MED:250/23D", modelos: ["JAC T6 2.0L", "JAC T8 2.0L"], precio: 653.56, imagenUrl: "/productos/emb-JAC-4DB2.jpg" },
  { codigo: "CHY-4T15B-O", nombre: "Kit de Embrague Jetour X70 / Tiggo 7 MED:232/20D", modelos: ["Jetour X70", "Chery Tiggo 7"], precio: 502.71, imagenUrl: "/productos/emb-CHY-4T15B-O.jpg" },
  { codigo: "KIA-Soluto-LHQTJ", nombre: "Kit de Embrague Kia Soluto 1.4 Sedán MED:200/24D", modelos: ["Kia Soluto 1.4"], precio: 361.33, imagenUrl: "/productos/emb-KIA-Soluto-LHQTJ.jpg" },
  { codigo: "SOLUTO-G4LC", nombre: "Kit de Embrague con Horquilla Kia Soluto 1.4 Sedán MED:200/24D", modelos: ["Kia Soluto 1.4"], precio: 582.4, imagenUrl: "/productos/emb-SOLUTO-G4LC.jpg" },
  { codigo: "MG-15S4C", nombre: "Kit de Embrague MG ZS / ZX SUV Collarín Hidráulico Ø200/18D", modelos: ["MG ZS", "MG ZX"], precio: 491.4, imagenUrl: "/productos/emb-MG-15S4C.jpg" },
  { codigo: "SHN-4F18", nombre: "Kit de Embrague Shineray X30 1.5L / Jinbei Van Pasajeros MED:180/18D", modelos: ["Shineray X30 1.5L", "Jinbei Van"], precio: 257.29, imagenUrl: "/productos/emb-SHN-4F18.jpg" },
  { codigo: "SHN-G14", nombre: "Kit de Embrague Shineray X30L 1.5L Van Pasajeros MED:210/20D", modelos: ["Shineray X30L 1.5L"], precio: 286.05, imagenUrl: "/productos/emb-SHN-G14.jpg" },
  { codigo: "SOU-A91", nombre: "Kit de Embrague Soueast DX3 SUV Ø190/20D", modelos: ["Soueast DX3"], precio: 398.99, imagenUrl: "/productos/emb-SOU-A91.jpg" },
] as const;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const marca = await prisma.marca.upsert({ where: { nombre: "Sin marca" }, update: {}, create: { nombre: "Sin marca", activo: true } });
  const cat = await prisma.categoria.upsert({
    where: { nombre: "Kits de Embrague" },
    update: {},
    create: { nombre: "Kits de Embrague", slug: "kits-de-embrague", activo: true },
  });

  let count = 0; const errors: string[] = [];
  for (const p of productos) {
    try {
      await prisma.producto.upsert({
        where: { codigo: p.codigo },
        update: { nombre: p.nombre, precio: p.precio, modelosCompatibles: [...p.modelos], imagenUrl: p.imagenUrl, categoriaId: cat.id, marcaId: marca.id, activo: true },
        create: { codigo: p.codigo, nombre: p.nombre, imagenUrl: p.imagenUrl, categoriaId: cat.id, marcaId: marca.id, modelosCompatibles: [...p.modelos], precio: p.precio, stock: 5, stockMinimo: 1, unidad: "kit", activo: true, destacado: false },
      });
      count++;
    } catch(e) { errors.push(`${p.codigo}: ${(e as Error).message}`); }
  }
  return NextResponse.json({ ok: true, importados: count, errores: errors });
}