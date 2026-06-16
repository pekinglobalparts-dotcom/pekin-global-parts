import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.IMPORT_SECRET || "pekin-import-2026";

const productos = [
  // KITS DE EMBRAGUE
  { codigo: "KE6001", nombre: "Kit de Embrague Toyota Hilux 2.4/2.8 D 2016-UP", cat: "Kits de Embrague", modelos: ["Toyota Hilux 2.4D 2016","Toyota Hilux 2.8D 2016","Toyota Hilux 2.4D 2017","Toyota Hilux 2.8D 2017","Toyota Hilux 2.4D 2018","Toyota Hilux 2.8D 2018"], precio: 411.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6002", nombre: "Kit de Embrague Toyota Hilux 2.5/3.0 D 2005-2015", cat: "Kits de Embrague", modelos: ["Toyota Hilux 2.5D 2005","Toyota Hilux 3.0D 2005","Toyota Hilux 2.5D 2010","Toyota Hilux 3.0D 2010","Toyota Hilux 2.5D 2015"], precio: 369.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6003", nombre: "Kit de Embrague Toyota Land Cruiser 4.2/4.5 D 2000-UP", cat: "Kits de Embrague", modelos: ["Toyota Land Cruiser 4.2D 2000","Toyota Land Cruiser 4.5D 2000","Toyota Land Cruiser 4.2D 2005","Toyota Land Cruiser 4.5D 2005"], precio: 529.20, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6004", nombre: "Kit de Embrague Nissan NP300 2.5 D 2015-UP", cat: "Kits de Embrague", modelos: ["Nissan NP300 2.5D 2015","Nissan NP300 2.5D 2016","Nissan NP300 2.5D 2017","Nissan NP300 2.5D 2018"], precio: 352.80, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6005", nombre: "Kit de Embrague Nissan Frontier 2.5 D 2008-UP", cat: "Kits de Embrague", modelos: ["Nissan Frontier 2.5D 2008","Nissan Frontier 2.5D 2010","Nissan Frontier 2.5D 2012","Nissan Frontier 2.5D 2014"], precio: 352.80, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6006", nombre: "Kit de Embrague Nissan Urvan 2.5 D 2001-UP", cat: "Kits de Embrague", modelos: ["Nissan Urvan 2.5D 2001","Nissan Urvan 2.5D 2005","Nissan Urvan 2.5D 2010","Nissan Urvan 2.5D 2015"], precio: 319.20, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6007", nombre: "Kit de Embrague Hyundai H1 2.5 D 2007-UP", cat: "Kits de Embrague", modelos: ["Hyundai H1 2.5D 2007","Hyundai H1 2.5D 2010","Hyundai H1 2.5D 2012","Hyundai H1 2.5D 2015","Hyundai H1 2.5D 2018"], precio: 319.20, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6008", nombre: "Kit de Embrague Hyundai Porter 2.5 D 2004-UP", cat: "Kits de Embrague", modelos: ["Hyundai Porter 2.5D 2004","Hyundai Porter 2.5D 2007","Hyundai Porter 2.5D 2010","Hyundai Porter 2.5D 2014"], precio: 285.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6009", nombre: "Kit de Embrague Kia Pregio 2.7 D 2004-UP", cat: "Kits de Embrague", modelos: ["Kia Pregio 2.7D 2004","Kia Pregio 2.7D 2006","Kia Pregio 2.7D 2008","Kia Pregio 2.7D 2010"], precio: 285.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6010", nombre: "Kit de Embrague Kia Bongo 2.5 D 2004-UP", cat: "Kits de Embrague", modelos: ["Kia Bongo 2.5D 2004","Kia Bongo 2.5D 2007","Kia Bongo 2.5D 2010","Kia Bongo 2.5D 2014"], precio: 285.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6011", nombre: "Kit de Embrague Mitsubishi L200 2.4 D 2016-UP", cat: "Kits de Embrague", modelos: ["Mitsubishi L200 2.4D 2016","Mitsubishi L200 2.4D 2017","Mitsubishi L200 2.4D 2018","Mitsubishi L200 2.4D 2019"], precio: 411.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6012", nombre: "Kit de Embrague Mitsubishi L200 2.5 D 2005-2015", cat: "Kits de Embrague", modelos: ["Mitsubishi L200 2.5D 2005","Mitsubishi L200 2.5D 2008","Mitsubishi L200 2.5D 2010","Mitsubishi L200 2.5D 2015"], precio: 369.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6013", nombre: "Kit de Embrague Ford Ranger 2.2/3.2 D 2012-UP", cat: "Kits de Embrague", modelos: ["Ford Ranger 2.2D 2012","Ford Ranger 3.2D 2012","Ford Ranger 2.2D 2015","Ford Ranger 3.2D 2015","Ford Ranger 2.2D 2018"], precio: 411.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6014", nombre: "Kit de Embrague Changan Star 1.3 2010-UP", cat: "Kits de Embrague", modelos: ["Changan Star 1.3 2010","Changan Star 1.3 2012","Changan Star 1.3 2014","Changan Star 1.3 2016"], precio: 168.00, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6015", nombre: "Kit de Embrague Changan Alsvin 1.4/1.5 2018-UP", cat: "Kits de Embrague", modelos: ["Changan Alsvin 1.4 2018","Changan Alsvin 1.5 2018","Changan Alsvin 1.4 2019","Changan Alsvin 1.5 2019"], precio: 201.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6016", nombre: "Kit de Embrague Chery QQ 0.8/1.1 2006-UP", cat: "Kits de Embrague", modelos: ["Chery QQ 0.8 2006","Chery QQ 1.1 2006","Chery QQ 0.8 2008","Chery QQ 1.1 2008","Chery QQ 1.1 2010"], precio: 151.20, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6017", nombre: "Kit de Embrague Chery Arauca 1.3 2012-UP", cat: "Kits de Embrague", modelos: ["Chery Arauca 1.3 2012","Chery Arauca 1.3 2014","Chery Arauca 1.3 2016","Chery Arauca 1.3 2018"], precio: 168.00, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6018", nombre: "Kit de Embrague JAC T6 2.0T 4x4 2017-UP", cat: "Kits de Embrague", modelos: ["JAC T6 2.0T 4x4 2017","JAC T6 2.0T 4x4 2018","JAC T6 2.0T 4x4 2019","JAC T6 2.0T 4x4 2020"], precio: 352.80, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6019", nombre: "Kit de Embrague JAC Sunray 2.8 D 2014-UP", cat: "Kits de Embrague", modelos: ["JAC Sunray 2.8D 2014","JAC Sunray 2.8D 2015","JAC Sunray 2.8D 2016","JAC Sunray 2.8D 2017"], precio: 285.60, desc: "Incluye: disco, prensa y collarín" },
  { codigo: "KE6020", nombre: "Kit de Embrague Great Wall Wingle 2.0/2.5 D 2010-UP", cat: "Kits de Embrague", modelos: ["Great Wall Wingle 2.0D 2010","Great Wall Wingle 2.5D 2010","Great Wall Wingle 2.0D 2013","Great Wall Wingle 2.5D 2013"], precio: 285.60, desc: "Incluye: disco, prensa y collarín" },
  // DISCOS DE EMBRAGUE (sueltos)
  { codigo: "DE6001", nombre: "Disco de Embrague Toyota Hilux 2.4/2.8 D 2016-UP 275mm", cat: "Discos de Embrague", modelos: ["Toyota Hilux 2.4D 2016","Toyota Hilux 2.8D 2016","Toyota Hilux 2.4D 2017","Toyota Hilux 2.8D 2017"], precio: 168.00, desc: "Diámetro: 275mm — acanalado 24 dientes" },
  { codigo: "DE6002", nombre: "Disco de Embrague Nissan NP300 2.5 D 2015-UP 250mm", cat: "Discos de Embrague", modelos: ["Nissan NP300 2.5D 2015","Nissan NP300 2.5D 2016","Nissan NP300 2.5D 2017"], precio: 134.40, desc: "Diámetro: 250mm — acanalado 21 dientes" },
  { codigo: "DE6003", nombre: "Disco de Embrague Hyundai H1 2.5 D 2007-UP 240mm", cat: "Discos de Embrague", modelos: ["Hyundai H1 2.5D 2007","Hyundai H1 2.5D 2010","Hyundai H1 2.5D 2015"], precio: 117.60, desc: "Diámetro: 240mm — acanalado 21 dientes" },
  { codigo: "DE6004", nombre: "Disco de Embrague Mitsubishi L200 2.4 D 2016-UP 275mm", cat: "Discos de Embrague", modelos: ["Mitsubishi L200 2.4D 2016","Mitsubishi L200 2.4D 2017","Mitsubishi L200 2.4D 2018"], precio: 168.00, desc: "Diámetro: 275mm — acanalado 26 dientes" },
  { codigo: "DE6005", nombre: "Disco de Embrague Ford Ranger 3.2 D 2012-UP 275mm", cat: "Discos de Embrague", modelos: ["Ford Ranger 3.2D 2012","Ford Ranger 3.2D 2015","Ford Ranger 3.2D 2018"], precio: 168.00, desc: "Diámetro: 275mm — acanalado 23 dientes" },
  // PRENSAS DE EMBRAGUE
  { codigo: "PE6001", nombre: "Prensa de Embrague Toyota Hilux 2.4/2.8 D 2016-UP", cat: "Prensas de Embrague", modelos: ["Toyota Hilux 2.4D 2016","Toyota Hilux 2.8D 2016","Toyota Hilux 2.4D 2017","Toyota Hilux 2.8D 2017"], precio: 184.80, desc: "Diámetro: 275mm" },
  { codigo: "PE6002", nombre: "Prensa de Embrague Nissan NP300 2.5 D 2015-UP", cat: "Prensas de Embrague", modelos: ["Nissan NP300 2.5D 2015","Nissan NP300 2.5D 2016","Nissan NP300 2.5D 2017"], precio: 168.00, desc: "Diámetro: 250mm" },
  { codigo: "PE6003", nombre: "Prensa de Embrague Hyundai H1 2.5 D 2007-UP", cat: "Prensas de Embrague", modelos: ["Hyundai H1 2.5D 2007","Hyundai H1 2.5D 2010","Hyundai H1 2.5D 2015"], precio: 151.20, desc: "Diámetro: 240mm" },
  { codigo: "PE6004", nombre: "Prensa de Embrague Mitsubishi L200 2.4 D 2016-UP", cat: "Prensas de Embrague", modelos: ["Mitsubishi L200 2.4D 2016","Mitsubishi L200 2.4D 2017","Mitsubishi L200 2.4D 2018"], precio: 184.80, desc: "Diámetro: 275mm" },
  { codigo: "PE6005", nombre: "Prensa de Embrague Ford Ranger 3.2 D 2012-UP", cat: "Prensas de Embrague", modelos: ["Ford Ranger 3.2D 2012","Ford Ranger 3.2D 2015","Ford Ranger 3.2D 2018"], precio: 184.80, desc: "Diámetro: 275mm" },
];

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const marca = await prisma.marca.upsert({
    where: { nombre: "Sin marca" },
    update: {},
    create: { nombre: "Sin marca", activo: true },
  });

  const catNames = [...new Set(productos.map(p => p.cat))];
  const catMap: Record<string, string> = {};
  for (const nombre of catNames) {
    const slug = nombre.toLowerCase()
      .replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u")
      .replace(/\s+/g, "-");
    const cat = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre, slug, activo: true },
    });
    catMap[nombre] = cat.id;
  }

  let count = 0;
  const errors: string[] = [];
  for (const p of productos) {
    try {
      await prisma.producto.upsert({
        where: { codigo: p.codigo },
        update: { nombre: p.nombre, descripcion: p.desc, precio: p.precio, modelosCompatibles: p.modelos, categoriaId: catMap[p.cat], marcaId: marca.id, activo: true },
        create: {
          codigo: p.codigo, nombre: p.nombre, descripcion: p.desc, imagenUrl: "",
          categoriaId: catMap[p.cat], marcaId: marca.id,
          modelosCompatibles: p.modelos, precio: p.precio,
          stock: 5, stockMinimo: 1, unidad: "kit", activo: true, destacado: false,
        },
      });
      count++;
    } catch (e) {
      errors.push(`${p.codigo}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true, importados: count, errores: errors });
}
