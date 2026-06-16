import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET || "pekin-import-2026";

const productos = [
  { codigo: "PN6037", nombre: "Pastilla de Freno Changan CX70 1.5 2017-UP / 1.6 2016-UP Posterior", cat: "Pastillas de Freno", modelos: ["Changan CX70 1.5 2017-UP", "Changan CX70 1.6 2016-UP"], precio: 44.1, imagenUrl: "/productos/freno-PN6037.jpg" },
  { codigo: "3501280BB01", nombre: "Pastilla de Freno Changan CX70 2016-UP Delantera", cat: "Pastillas de Freno", modelos: ["Changan CX70 2016-UP"], precio: 55.44, imagenUrl: "/productos/freno-3501280BB01.jpg" },
  { codigo: "3501050", nombre: "Pastilla de Freno Changan New Van M201 1.2L Delantera", cat: "Pastillas de Freno", modelos: ["Changan New Van M201 1.2L"], precio: 44.1, imagenUrl: "/productos/freno-3501050.jpg" },
  { codigo: "D2311-9546", nombre: "Pastilla de Freno Changhe Minivan / Chery QQ / Chevrolet N200 Delantera", cat: "Pastillas de Freno", modelos: ["Changhe Minivan", "Chery QQ", "Chevrolet N200"], precio: 50.4, imagenUrl: "" },
  { codigo: "D1674-8903", nombre: "Pastilla de Freno Chery A3 / A5 / Tiggo / Tiggo 3 Delantera", cat: "Pastillas de Freno", modelos: ["Chery A3", "Chery A5", "Chery Tiggo", "Chery Tiggo 3"], precio: 54.18, imagenUrl: "/productos/freno-D1674-8903.jpg" },
  { codigo: "D1321-8433", nombre: "Pastilla de Freno Chery QQ 2002-UP / Chevrolet Spark 2005-2015 / Daewoo Lanos / Matiz 2005-2015 Delantera", cat: "Pastillas de Freno", modelos: ["Chery QQ 2002-UP", "Chevrolet Spark 2005-2015", "Daewoo Lanos 2005-2015", "Daewoo Matiz 2005-2015"], precio: 49.14, imagenUrl: "/productos/freno-D1321-8433.jpg" },
  { codigo: "D696-7570", nombre: "Pastilla de Freno Chery Tiggo 2005-2008 / Chevrolet N300 2012-2021 / VW Golf 1995-1996 / Passat Delantera", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 2005-2008", "Chevrolet N300 2012-2021", "Volkswagen Golf 1995-1996", "Volkswagen Passat"], precio: 61.74, imagenUrl: "/productos/freno-D696-7570.jpg" },
  { codigo: "D1051-7955", nombre: "Pastilla de Freno Chery Tiggo 2005-2013 / Toyota RAV4 2000-2005 Posterior", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 2005-2013", "Toyota RAV4 2000-2005"], precio: 36.54, imagenUrl: "" },
  { codigo: "J69-6GN3501080", nombre: "Pastilla de Freno Chery Tiggo 2 1.5L / Baic X35 2021-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 2 1.5L", "Baic X35 2021-UP"], precio: 46.62, imagenUrl: "/productos/freno-J69-6GN3501080.jpg" },
  { codigo: "D2263-9503", nombre: "Pastilla de Freno Chery Tiggo 7 Pro / DFSK Glory 580 Posterior", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 7 Pro", "DFSK Glory 580"], precio: 47.88, imagenUrl: "/productos/freno-D2263-9503.jpg" },
  { codigo: "D1269-8385", nombre: "Pastilla de Freno Chevrolet Aveo 2002-2008 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Aveo 2002-2008"], precio: 47.88, imagenUrl: "/productos/freno-D1269-8385.jpg" },
  { codigo: "D1269-8385", nombre: "Pastilla de Freno Chevrolet Aveo 2002-2008 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Aveo 2002-2008"], precio: 59.22, imagenUrl: "" },
  { codigo: "D902-7779", nombre: "Pastilla de Freno Chevrolet Aveo / Vivant / Daewoo Nubira Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Aveo", "Chevrolet Vivant", "Daewoo Nubira"], precio: 56.7, imagenUrl: "/productos/freno-D902-7779.jpg" },
  { codigo: "D0797-7667", nombre: "Pastilla de Freno Chevrolet Aveo / Vivant / Daewoo Nubira Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Aveo", "Chevrolet Vivant", "Daewoo Nubira"], precio: 68.04, imagenUrl: "/productos/freno-D0797-7667.jpg" },
  { codigo: "D726-7593", nombre: "Pastilla de Freno Chevrolet Blazer 1997-2004 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Blazer 1997-2004"], precio: 76.85, imagenUrl: "/productos/freno-D726-7593.jpg" },
  { codigo: "D1264-8381", nombre: "Pastilla de Freno Chevrolet Captiva 2006-2016 / Equinox 2003-2009 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Captiva 2006-2016", "Chevrolet Equinox 2003-2009"], precio: 65.52, imagenUrl: "/productos/freno-D1264-8381.jpg" },
  { codigo: "23623675", nombre: "Pastilla de Freno Chevrolet Captiva 1.5 2019-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Captiva 1.5 2019-UP"], precio: 57.96, imagenUrl: "/productos/freno-23623675.jpg" },
  { codigo: "23623675", nombre: "Pastilla de Freno Chevrolet Captiva 1.5 2019-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Captiva 1.5 2019-UP"], precio: 74.34, imagenUrl: "/productos/freno-23623675.jpg" },
  { codigo: "D1883-9111", nombre: "Pastilla de Freno Chevrolet Captiva 2019-UP / Groove 2021-UP Posterior", cat: "Pastillas de Freno", modelos: ["Chevrolet Captiva 2019-UP", "Chevrolet Groove 2021-UP"], precio: 36.54, imagenUrl: "" },
  { codigo: "D1039-7943", nombre: "Pastilla de Freno Chevrolet Colorado 2003-2012 / Isuzu D-Max 2004-2008 / Great Wall H3 2020-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Colorado 2003-2012", "Isuzu D-Max 2004-2008", "Great Wall H3 2020-UP"], precio: 55.44, imagenUrl: "" },
  { codigo: "D688-7563", nombre: "Pastilla de Freno Chevrolet Corsa Brasil / Chevy Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Corsa Brasil", "Chevrolet Chevy"], precio: 59.22, imagenUrl: "/productos/freno-D688-7563.jpg" },
  { codigo: "D1497-8697", nombre: "Pastilla de Freno Chevrolet Cruze 2009-2018 / Aveo T300 2011-2015 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Cruze 2009-2018", "Chevrolet Aveo T300 2011-2015"], precio: 60.48, imagenUrl: "/productos/freno-D1497-8697.jpg" },
  { codigo: "D1468-8668", nombre: "Pastilla de Freno Chevrolet Cruze 2013-2018 / Optra 2014-UP / Sonic 2011-2017 / Orlando 2011-2018 Posterior", cat: "Pastillas de Freno", modelos: ["Chevrolet Cruze 2013-2018", "Chevrolet Optra 2014-UP", "Chevrolet Sonic 2011-2017", "Chevrolet Orlando 2011-2018"], precio: 47.88, imagenUrl: "/productos/freno-D1468-8668.jpg" },
  { codigo: "D684-7X71", nombre: "Pastilla de Freno Chevrolet N300 / Geely CK Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet N300", "Geely CK"], precio: 61.74, imagenUrl: "/productos/freno-D684-7X71.jpg" },
  { codigo: "D-0450-71Y4", nombre: "Pastilla de Freno Chevrolet Prisma / Onix / Cobalt Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Prisma", "Chevrolet Onix", "Chevrolet Cobalt"], precio: 61.74, imagenUrl: "/productos/freno-D-0450-71Y4.jpg" },
  { codigo: "D1661-8888", nombre: "Pastilla de Freno Chevrolet Sail 1.4 LCU 2010-2016 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Sail 1.4 2010-2016"], precio: 44.1, imagenUrl: "/productos/freno-D1661-8888.jpg" },
  { codigo: "D1942-9167", nombre: "Pastilla de Freno Chevrolet Sail S3 L2B 2017-2023 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Sail S3 2017-2023"], precio: 52.92, imagenUrl: "/productos/freno-D1942-9167.jpg" },
  { codigo: "D1864-9093", nombre: "Pastilla de Freno Chevrolet Spark 2016-2022 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Spark 2016-2022"], precio: 54.18, imagenUrl: "" },
  { codigo: "D2019-9144", nombre: "Pastilla de Freno Chevrolet Tracker 2016-2019 / Malibu 2015-2018 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Tracker 2016-2019", "Chevrolet Malibu 2015-2018"], precio: 56.7, imagenUrl: "/productos/freno-D2019-9144.jpg" },
  { codigo: "D882-7759", nombre: "Pastilla de Freno Chevrolet Trailblazer 2002-2006 Delantera", cat: "Pastillas de Freno", modelos: ["Chevrolet Trailblazer 2002-2006"], precio: 84.42, imagenUrl: "/productos/freno-D882-7759.jpg" },
  { codigo: "D883-7760", nombre: "Pastilla de Freno Chevrolet Trailblazer 2002-2008 / Traverse 2009 Posterior", cat: "Pastillas de Freno", modelos: ["Chevrolet Trailblazer 2002-2008", "Chevrolet Traverse 2009"], precio: 64.26, imagenUrl: "/productos/freno-D883-7760.jpg" },
  { codigo: "D0281-7104", nombre: "Pastilla de Freno Daewoo Damas / Magnus / Suzuki Maruti Super Carry 1.3 2000-2010 Delantera", cat: "Pastillas de Freno", modelos: ["Daewoo Damas", "Daewoo Magnus", "Suzuki Maruti Super Carry 1.3 2000-2010"], precio: 47.88, imagenUrl: "/productos/freno-D0281-7104.jpg" },
  { codigo: "D1471-8671", nombre: "Pastilla de Freno Daihatsu Terios 2007-2012 / Suzuki APV 2004-UP / Toyota Avanza 2003-2018 Delantera", cat: "Pastillas de Freno", modelos: ["Daihatsu Terios 2007-2012", "Suzuki APV 2004-UP", "Toyota Avanza 2003-2018"], precio: 40.32, imagenUrl: "/productos/freno-D1471-8671.jpg" },
  { codigo: "D2286-8947", nombre: "Pastilla de Freno Daihatsu Terios / Toyota Rush Delantera", cat: "Pastillas de Freno", modelos: ["Daihatsu Terios", "Toyota Rush"], precio: 50.4, imagenUrl: "/productos/freno-D2286-8947.jpg" },
  { codigo: "3502500-FB01", nombre: "Pastilla de Freno DFSK Glory 580 1.8L / 1.5T Posterior", cat: "Pastillas de Freno", modelos: ["DFSK Glory 580 1.8L", "DFSK Glory 580 1.5T"], precio: 74.48, imagenUrl: "" },
  { codigo: "D1498-8698", nombre: "Pastilla de Freno Dodge Durango 2011-2022 / Jeep Grand Cherokee 2013-2021 Posterior", cat: "Pastillas de Freno", modelos: ["Dodge Durango 2011-2022", "Jeep Grand Cherokee 2013-2021"], precio: 91.98, imagenUrl: "" },
  { codigo: "D350-7242", nombre: "Pastilla de Freno Fiat Fiorino / Volkswagen Fox / Gol Delantera", cat: "Pastillas de Freno", modelos: ["Fiat Fiorino", "Volkswagen Fox", "Volkswagen Gol"], precio: 71.83, imagenUrl: "/productos/freno-D350-7242.jpg" },
  { codigo: "D298-7X54", nombre: "Pastilla de Freno Fiat Palio Adventure 2004-2009 Delantera", cat: "Pastillas de Freno", modelos: ["Fiat Palio Adventure 2004-2009"], precio: 70.56, imagenUrl: "/productos/freno-D298-7X54.jpg" },
  { codigo: "7947-D1044", nombre: "Pastilla de Freno Ford Ecosport 2013-2017 / Focus 2004-2008 / Mazda 3 2003-2013 / Volvo S40 2004-2012 Delantera", cat: "Pastillas de Freno", modelos: ["Ford Ecosport 2013-2017", "Ford Focus 2004-2008", "Mazda 3 2003-2013", "Volvo S40 2004-2012"], precio: 63.0, imagenUrl: "/productos/freno-7947-D1044.jpg" },
  { codigo: "D843-7719", nombre: "Pastilla de Freno Ford Escape 2001-2007 / Mazda Tribute 2001-2004 Delantera", cat: "Pastillas de Freno", modelos: ["Ford Escape 2001-2007", "Mazda Tribute 2001-2004"], precio: 84.42, imagenUrl: "/productos/freno-D843-7719.jpg" },
  { codigo: "D1508-8715", nombre: "Pastilla de Freno Ford Explorer 2010-2019 Delantera", cat: "Pastillas de Freno", modelos: ["Ford Explorer 2010-2019"], precio: 76.85, imagenUrl: "/productos/freno-D1508-8715.jpg" },
  { codigo: "D1611-8855", nombre: "Pastilla de Freno Ford Explorer 2013-2019 Delantera", cat: "Pastillas de Freno", modelos: ["Ford Explorer 2013-2019"], precio: 70.56, imagenUrl: "/productos/freno-D1611-8855.jpg" },
  { codigo: "D1754-8488", nombre: "Pastilla de Freno Ford Explorer 2019-UP Delantera", cat: "Pastillas de Freno", modelos: ["Ford Explorer 2019-UP"], precio: 42.84, imagenUrl: "/productos/freno-D1754-8488.jpg" },
  { codigo: "D652-7532", nombre: "Pastilla de Freno Ford Explorer 1996-2000 / Ranger 1995-1998 / Mazda B2600 1985-1999 Delantera", cat: "Pastillas de Freno", modelos: ["Ford Explorer 1996-2000", "Ford Ranger 1995-1998", "Mazda B2600 1985-1999"], precio: 78.12, imagenUrl: "/productos/freno-D652-7532.jpg" },
  { codigo: "D679-7558", nombre: "Pastilla de Freno Ford F-150 1996-2004 Delantera", cat: "Pastillas de Freno", modelos: ["Ford F-150 1996-2004"], precio: 69.3, imagenUrl: "/productos/freno-D679-7558.jpg" },
  { codigo: "D833-7706", nombre: "Pastilla de Freno Ford Ranger 2003-2011 / Explorer 2002-2009 / Chevrolet Equinox 2003-2009 Delantera", cat: "Pastillas de Freno", modelos: ["Ford Ranger 2003-2011", "Ford Explorer 2002-2009", "Chevrolet Equinox 2003-2009"], precio: 73.08, imagenUrl: "/productos/freno-D833-7706.jpg" },
  { codigo: "D2085-9320", nombre: "Pastilla de Freno Ford Ranger 2019-UP / Ranger Raptor 2022-UP Delantera", cat: "Pastillas de Freno", modelos: ["Ford Ranger 2019-UP", "Ford Ranger Raptor 2022-UP"], precio: 61.74, imagenUrl: "/productos/freno-D2085-9320.jpg" },
  { codigo: "D1676-8905", nombre: "Pastilla de Freno Ford Ranger Argentina / Mazda BT-50 / Isuzu D-Max 4x4 2019-UP Delantera", cat: "Pastillas de Freno", modelos: ["Ford Ranger Argentina 2019-UP", "Mazda BT-50 2019-UP", "Isuzu D-Max 4x4 2019-UP"], precio: 76.85, imagenUrl: "/productos/freno-D1676-8905.jpg" },
  { codigo: "D1676-8905", nombre: "Pastilla de Freno Ford Ranger Argentina / Mazda BT-50 / Isuzu D-Max 4x4 2019-UP Delantera", cat: "Pastillas de Freno", modelos: ["Ford Ranger Argentina 2019-UP", "Mazda BT-50 2019-UP", "Isuzu D-Max 4x4 2019-UP"], precio: 60.48, imagenUrl: "" },
  { codigo: "D2260-9498", nombre: "Pastilla de Freno Ford Transit Delantera", cat: "Pastillas de Freno", modelos: ["Ford Transit"], precio: 56.7, imagenUrl: "" },
] as const;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const marca = await prisma.marca.upsert({ where: { nombre: "Sin marca" }, update: {}, create: { nombre: "Sin marca", activo: true } });
  const cat = await prisma.categoria.upsert({
    where: { nombre: "Pastillas de Freno" },
    update: {},
    create: { nombre: "Pastillas de Freno", slug: "pastillas-de-freno", activo: true },
  });

  let count = 0;
  const errors: string[] = [];
  for (const p of productos) {
    try {
      await prisma.producto.upsert({
        where: { codigo: p.codigo },
        update: { nombre: p.nombre, precio: p.precio, modelosCompatibles: [...p.modelos], imagenUrl: p.imagenUrl, categoriaId: cat.id, marcaId: marca.id, activo: true },
        create: { codigo: p.codigo, nombre: p.nombre, imagenUrl: p.imagenUrl, categoriaId: cat.id, marcaId: marca.id, modelosCompatibles: [...p.modelos], precio: p.precio, stock: 10, stockMinimo: 2, unidad: "und", activo: true, destacado: false },
      });
      count++;
    } catch(e) { errors.push(`${p.codigo}: ${(e as Error).message}`); }
  }
  return NextResponse.json({ ok: true, importados: count, errores: errors });
}