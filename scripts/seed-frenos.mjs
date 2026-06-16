// node scripts/seed-frenos.mjs
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env
const envPath = resolve(process.cwd(), ".env.local");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && !process.env[k]) process.env[k.trim()] = v.join("=").trim();
  }
} catch {}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const productos = [
  // PASTILLAS DE FRENO
  { codigo: "PN6001", nombre: "Pastilla de Freno Toyota Hilux 2.4/2.8 2016-UP Delantera", cat: "Pastillas de Freno", modelos: ["Toyota Hilux 2.4 2016","Toyota Hilux 2.8 2016","Toyota Hilux 2.4 2017","Toyota Hilux 2.8 2017","Toyota Hilux 2.4 2018","Toyota Hilux 2.8 2018"], precio: 75.60 },
  { codigo: "PN6002", nombre: "Pastilla de Freno Toyota Hilux 2.4/2.8 2016-UP Posterior", cat: "Pastillas de Freno", modelos: ["Toyota Hilux 2.4 2016","Toyota Hilux 2.8 2016","Toyota Hilux 2.4 2017","Toyota Hilux 2.8 2017"], precio: 63.00 },
  { codigo: "PN6003", nombre: "Pastilla de Freno Toyota RAV4 2.0/2.5 2019-UP Delantera", cat: "Pastillas de Freno", modelos: ["Toyota RAV4 2.0 2019","Toyota RAV4 2.5 2019","Toyota RAV4 2.0 2020","Toyota RAV4 2.5 2020"], precio: 75.60 },
  { codigo: "PN6004", nombre: "Pastilla de Freno Toyota RAV4 2.0/2.5 2019-UP Posterior", cat: "Pastillas de Freno", modelos: ["Toyota RAV4 2.0 2019","Toyota RAV4 2.5 2019","Toyota RAV4 2.5 2020"], precio: 63.00 },
  { codigo: "PN6005", nombre: "Pastilla de Freno Nissan NP300 2.5 2015-UP Delantera", cat: "Pastillas de Freno", modelos: ["Nissan NP300 2.5 2015","Nissan NP300 2.5 2016","Nissan NP300 2.5 2017","Nissan NP300 2.5 2018"], precio: 63.00 },
  { codigo: "PN6006", nombre: "Pastilla de Freno Nissan NP300 2.5 2015-UP Posterior", cat: "Pastillas de Freno", modelos: ["Nissan NP300 2.5 2015","Nissan NP300 2.5 2016","Nissan NP300 2.5 2017"], precio: 50.40 },
  { codigo: "PN6007", nombre: "Pastilla de Freno Nissan X-Trail 2.0/2.5 2014-UP Delantera", cat: "Pastillas de Freno", modelos: ["Nissan X-Trail 2.0 2014","Nissan X-Trail 2.5 2014","Nissan X-Trail 2.0 2015","Nissan X-Trail 2.5 2015"], precio: 63.00 },
  { codigo: "PN6008", nombre: "Pastilla de Freno Nissan X-Trail 2.0/2.5 2014-UP Posterior", cat: "Pastillas de Freno", modelos: ["Nissan X-Trail 2.0 2014","Nissan X-Trail 2.5 2014","Nissan X-Trail 2.5 2015"], precio: 50.40 },
  { codigo: "PN6009", nombre: "Pastilla de Freno Hyundai Tucson 2.0 2016-UP Delantera", cat: "Pastillas de Freno", modelos: ["Hyundai Tucson 2.0 2016","Hyundai Tucson 2.0 2017","Hyundai Tucson 2.0 2018","Hyundai Tucson 2.0 2019"], precio: 63.00 },
  { codigo: "PN6010", nombre: "Pastilla de Freno Hyundai Tucson 2.0 2016-UP Posterior", cat: "Pastillas de Freno", modelos: ["Hyundai Tucson 2.0 2016","Hyundai Tucson 2.0 2017","Hyundai Tucson 2.0 2018"], precio: 50.40 },
  { codigo: "PN6011", nombre: "Pastilla de Freno Hyundai Santa Fe 2.4/2.2D 2013-UP Delantera", cat: "Pastillas de Freno", modelos: ["Hyundai Santa Fe 2.4 2013","Hyundai Santa Fe 2.2D 2013","Hyundai Santa Fe 2.4 2014"], precio: 69.30 },
  { codigo: "PN6012", nombre: "Pastilla de Freno Hyundai Santa Fe 2.4/2.2D 2013-UP Posterior", cat: "Pastillas de Freno", modelos: ["Hyundai Santa Fe 2.4 2013","Hyundai Santa Fe 2.2D 2013"], precio: 56.70 },
  { codigo: "PN6013", nombre: "Pastilla de Freno Kia Sportage 2.0 2016-UP Delantera", cat: "Pastillas de Freno", modelos: ["Kia Sportage 2.0 2016","Kia Sportage 2.0 2017","Kia Sportage 2.0 2018","Kia Sportage 2.0 2019"], precio: 63.00 },
  { codigo: "PN6014", nombre: "Pastilla de Freno Kia Sportage 2.0 2016-UP Posterior", cat: "Pastillas de Freno", modelos: ["Kia Sportage 2.0 2016","Kia Sportage 2.0 2017","Kia Sportage 2.0 2018"], precio: 50.40 },
  { codigo: "PN6015", nombre: "Pastilla de Freno Kia Sorento 2.4/2.2D 2015-UP Delantera", cat: "Pastillas de Freno", modelos: ["Kia Sorento 2.4 2015","Kia Sorento 2.2D 2015","Kia Sorento 2.4 2016"], precio: 69.30 },
  { codigo: "PN6016", nombre: "Pastilla de Freno Kia Sorento 2.4/2.2D 2015-UP Posterior", cat: "Pastillas de Freno", modelos: ["Kia Sorento 2.4 2015","Kia Sorento 2.2D 2015"], precio: 56.70 },
  { codigo: "PN6017", nombre: "Pastilla de Freno JAC S3 1.5 2015-UP Delantera", cat: "Pastillas de Freno", modelos: ["JAC S3 1.5 2015","JAC S3 1.5 2016","JAC S3 1.5 2017"], precio: 44.10 },
  { codigo: "PN6018", nombre: "Pastilla de Freno JAC S5 2.0T 2013-UP Delantera", cat: "Pastillas de Freno", modelos: ["JAC S5 2.0T 2013","JAC S5 2.0T 2014","JAC S5 2.0T 2015"], precio: 50.40 },
  { codigo: "PN6019", nombre: "Pastilla de Freno JAC S5 2.0T 2013-UP Posterior", cat: "Pastillas de Freno", modelos: ["JAC S5 2.0T 2013","JAC S5 2.0T 2014","JAC S5 2.0T 2015"], precio: 44.10 },
  { codigo: "PN6020", nombre: "Pastilla de Freno Mitsubishi L200 2.4D 2016-UP Delantera", cat: "Pastillas de Freno", modelos: ["Mitsubishi L200 2.4D 2016","Mitsubishi L200 2.4D 2017","Mitsubishi L200 2.4D 2018"], precio: 69.30 },
  { codigo: "PN6021", nombre: "Pastilla de Freno Mitsubishi L200 2.4D 2016-UP Posterior", cat: "Pastillas de Freno", modelos: ["Mitsubishi L200 2.4D 2016","Mitsubishi L200 2.4D 2017"], precio: 56.70 },
  { codigo: "PN6022", nombre: "Pastilla de Freno Mitsubishi Outlander 2.4 2014-UP Delantera", cat: "Pastillas de Freno", modelos: ["Mitsubishi Outlander 2.4 2014","Mitsubishi Outlander 2.4 2015","Mitsubishi Outlander 2.4 2016"], precio: 63.00 },
  { codigo: "PN6023", nombre: "Pastilla de Freno Mitsubishi Outlander 2.4 2014-UP Posterior", cat: "Pastillas de Freno", modelos: ["Mitsubishi Outlander 2.4 2014","Mitsubishi Outlander 2.4 2015"], precio: 50.40 },
  { codigo: "PN6024", nombre: "Pastilla de Freno Ford Ranger 2.2/3.2D 2012-UP Delantera", cat: "Pastillas de Freno", modelos: ["Ford Ranger 2.2D 2012","Ford Ranger 3.2D 2012","Ford Ranger 2.2D 2013","Ford Ranger 3.2D 2013"], precio: 69.30 },
  { codigo: "PN6025", nombre: "Pastilla de Freno Ford Ranger 2.2/3.2D 2012-UP Posterior", cat: "Pastillas de Freno", modelos: ["Ford Ranger 2.2D 2012","Ford Ranger 3.2D 2012"], precio: 56.70 },
  { codigo: "PN6026", nombre: "Pastilla de Freno Changan CS35 1.6 2013-UP Delantera", cat: "Pastillas de Freno", modelos: ["Changan CS35 1.6 2013","Changan CS35 1.6 2014","Changan CS35 1.6 2015"], precio: 50.40 },
  { codigo: "PN6027", nombre: "Pastilla de Freno Changan CS35 1.6 2013-UP Posterior", cat: "Pastillas de Freno", modelos: ["Changan CS35 1.6 2013","Changan CS35 1.6 2014","Changan CS35 1.6 2015"], precio: 44.10 },
  { codigo: "PN6028", nombre: "Pastilla de Freno Changan CS75 2.0 2014-UP Delantera", cat: "Pastillas de Freno", modelos: ["Changan CS75 2.0 2014","Changan CS75 2.0 2015","Changan CS75 2.0 2016"], precio: 56.70 },
  { codigo: "PN6029", nombre: "Pastilla de Freno Changan CS75 2.0 2014-UP Posterior", cat: "Pastillas de Freno", modelos: ["Changan CS75 2.0 2014","Changan CS75 2.0 2015","Changan CS75 2.0 2016"], precio: 50.40 },
  { codigo: "PN6030", nombre: "Pastilla de Freno Chery Tiggo 2.0 2006-2013 Delantera", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 2.0 2006","Chery Tiggo 2.0 2007","Chery Tiggo 2.0 2008","Chery Tiggo 2.0 2009","Chery Tiggo 2.0 2013"], precio: 44.10 },
  { codigo: "PN6031", nombre: "Pastilla de Freno Chery Tiggo 2.0 2006-2013 Posterior", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 2.0 2006","Chery Tiggo 2.0 2007","Chery Tiggo 2.0 2008","Chery Tiggo 2.0 2013"], precio: 37.80 },
  { codigo: "PN6032", nombre: "Pastilla de Freno Chery Tiggo 3 1.6 2014-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 3 1.6 2014","Chery Tiggo 3 1.6 2015","Chery Tiggo 3 1.6 2016"], precio: 50.40 },
  { codigo: "PN6033", nombre: "Pastilla de Freno Chery Tiggo 5 2.0 2014-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 5 2.0 2014","Chery Tiggo 5 2.0 2015","Chery Tiggo 5 2.0 2016"], precio: 56.70 },
  { codigo: "PN6034", nombre: "Pastilla de Freno Chery Tiggo 5 2.0 2014-UP Posterior", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 5 2.0 2014","Chery Tiggo 5 2.0 2015","Chery Tiggo 5 2.0 2016"], precio: 44.10 },
  { codigo: "PN6035", nombre: "Pastilla de Freno Chery Tiggo 7 1.5T 2018-UP Delantera", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 7 1.5T 2018","Chery Tiggo 7 1.5T 2019","Chery Tiggo 7 1.5T 2020"], precio: 63.00 },
  { codigo: "PN6036", nombre: "Pastilla de Freno Chery Tiggo 7 1.5T 2018-UP Posterior", cat: "Pastillas de Freno", modelos: ["Chery Tiggo 7 1.5T 2018","Chery Tiggo 7 1.5T 2019","Chery Tiggo 7 1.5T 2020"], precio: 50.40 },
  { codigo: "PN6037", nombre: "Pastilla de Freno Changan CX70 1.5/1.6 2016-UP Posterior", cat: "Pastillas de Freno", modelos: ["Changan CX70 1.5 2017","Changan CX70 1.6 2016"], precio: 44.10 },
  { codigo: "PN6038", nombre: "Pastilla de Freno Great Wall Wingle 2.0/2.5D 2010-UP Delantera", cat: "Pastillas de Freno", modelos: ["Great Wall Wingle 2.0 2010","Great Wall Wingle 2.5D 2010","Great Wall Wingle 2.0 2011"], precio: 50.40 },
  { codigo: "PN6039", nombre: "Pastilla de Freno Haval H6 1.5T/2.0T 2014-UP Delantera", cat: "Pastillas de Freno", modelos: ["Haval H6 1.5T 2014","Haval H6 2.0T 2014","Haval H6 1.5T 2015","Haval H6 2.0T 2015"], precio: 56.70 },
  { codigo: "PN6040", nombre: "Pastilla de Freno Haval H6 1.5T/2.0T 2014-UP Posterior", cat: "Pastillas de Freno", modelos: ["Haval H6 1.5T 2014","Haval H6 2.0T 2014","Haval H6 1.5T 2015"], precio: 44.10 },

  // ZAPATAS DE FRENO
  { codigo: "ZN6001", nombre: "Zapata de Freno Toyota Hilux 2.4/2.8 2016-UP Posterior", cat: "Zapatas de Freno", modelos: ["Toyota Hilux 2.4 2016","Toyota Hilux 2.8 2016","Toyota Hilux 2.4 2017","Toyota Hilux 2.8 2017"], precio: 56.70 },
  { codigo: "ZN6002", nombre: "Zapata de Freno Nissan NP300 2.5 2015-UP Posterior", cat: "Zapatas de Freno", modelos: ["Nissan NP300 2.5 2015","Nissan NP300 2.5 2016","Nissan NP300 2.5 2017"], precio: 50.40 },
  { codigo: "ZN6003", nombre: "Zapata de Freno Hyundai H1 2.5D 2007-UP Posterior", cat: "Zapatas de Freno", modelos: ["Hyundai H1 2.5D 2007","Hyundai H1 2.5D 2008","Hyundai H1 2.5D 2009","Hyundai H1 2.5D 2010"], precio: 63.00 },
  { codigo: "ZN6004", nombre: "Zapata de Freno Chery Tiggo 2.0 2006-2013 Posterior", cat: "Zapatas de Freno", modelos: ["Chery Tiggo 2.0 2006","Chery Tiggo 2.0 2007","Chery Tiggo 2.0 2008","Chery Tiggo 2.0 2009"], precio: 37.80 },
  { codigo: "ZN6005", nombre: "Zapata de Freno JAC S3 1.5 2015-UP Posterior", cat: "Zapatas de Freno", modelos: ["JAC S3 1.5 2015","JAC S3 1.5 2016","JAC S3 1.5 2017"], precio: 37.80 },
  { codigo: "ZN6006", nombre: "Zapata de Freno Changan CS35 1.6 2013-UP Posterior", cat: "Zapatas de Freno", modelos: ["Changan CS35 1.6 2013","Changan CS35 1.6 2014","Changan CS35 1.6 2015"], precio: 37.80 },
  { codigo: "ZN6007", nombre: "Zapata de Freno Mitsubishi L200 2.4D 2016-UP Posterior", cat: "Zapatas de Freno", modelos: ["Mitsubishi L200 2.4D 2016","Mitsubishi L200 2.4D 2017"], precio: 50.40 },
  { codigo: "ZN6008", nombre: "Zapata de Freno Ford Ranger 2.2/3.2D 2012-UP Posterior", cat: "Zapatas de Freno", modelos: ["Ford Ranger 2.2D 2012","Ford Ranger 3.2D 2012"], precio: 50.40 },
  { codigo: "ZN6009", nombre: "Zapata de Freno Great Wall Wingle 2.0/2.5D 2010-UP Posterior", cat: "Zapatas de Freno", modelos: ["Great Wall Wingle 2.0 2010","Great Wall Wingle 2.5D 2010","Great Wall Wingle 2.0 2011"], precio: 44.10 },
  { codigo: "ZN6010", nombre: "Zapata de Freno JAC Sunray 2.8D 2014-UP Posterior", cat: "Zapatas de Freno", modelos: ["JAC Sunray 2.8D 2014","JAC Sunray 2.8D 2015","JAC Sunray 2.8D 2016"], precio: 50.40 },
];

async function main() {
  const marca = await prisma.marca.upsert({
    where: { nombre: "Sin marca" },
    update: {},
    create: { nombre: "Sin marca", activo: true },
  });

  const catNames = [...new Set(productos.map(p => p.cat))];
  const catMap = {};
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
  for (const p of productos) {
    await prisma.producto.upsert({
      where: { codigo: p.codigo },
      update: { nombre: p.nombre, precio: p.precio, modelosCompatibles: p.modelos, categoriaId: catMap[p.cat], marcaId: marca.id, activo: true },
      create: {
        codigo: p.codigo, nombre: p.nombre, imagenUrl: "",
        categoriaId: catMap[p.cat], marcaId: marca.id,
        modelosCompatibles: p.modelos, precio: p.precio,
        stock: 10, stockMinimo: 2, unidad: "und", activo: true, destacado: false,
      },
    });
    count++;
  }

  console.log(`✅ ${count} productos importados.`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
