// Run: npx ts-node scripts/import-frenos.ts
// Imports brake products from Renusa/Boottelli catalog with 40% margin, no brand attribution

const BASE_URL = process.env.IMPORT_BASE_URL || "http://localhost:3000";
const ADMIN_COOKIE = process.env.ADMIN_COOKIE || "";

// Prices from catalog × 1.40 margin, codes without -BTL suffix
// Category: Pastillas de Freno or Zapatas de Freno
const productos = [
  // === PASTILLAS DE FRENO ===
  { codigo: "PN6037", nombre: "Pastilla de Freno Changan CX70 1.5/1.6 2016-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Changan CX70 1.5 2017", "Changan CX70 1.6 2016"], precio: 44.10, stock: 10 },
  { codigo: "PN6026", nombre: "Pastilla de Freno Changan CS35 1.6 2013-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Changan CS35 1.6 2013", "Changan CS35 1.6 2014", "Changan CS35 1.6 2015"], precio: 50.40, stock: 10 },
  { codigo: "PN6027", nombre: "Pastilla de Freno Changan CS35 1.6 2013-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Changan CS35 1.6 2013", "Changan CS35 1.6 2014", "Changan CS35 1.6 2015"], precio: 44.10, stock: 10 },
  { codigo: "PN6028", nombre: "Pastilla de Freno Changan CS75 2.0 2014-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Changan CS75 2.0 2014", "Changan CS75 2.0 2015", "Changan CS75 2.0 2016"], precio: 56.70, stock: 10 },
  { codigo: "PN6029", nombre: "Pastilla de Freno Changan CS75 2.0 2014-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Changan CS75 2.0 2014", "Changan CS75 2.0 2015", "Changan CS75 2.0 2016"], precio: 50.40, stock: 10 },
  { codigo: "PN6030", nombre: "Pastilla de Freno Chery Tiggo 2.0 2006-2013 Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 2.0 2006", "Chery Tiggo 2.0 2007", "Chery Tiggo 2.0 2008", "Chery Tiggo 2.0 2009", "Chery Tiggo 2.0 2010", "Chery Tiggo 2.0 2013"], precio: 44.10, stock: 10 },
  { codigo: "PN6031", nombre: "Pastilla de Freno Chery Tiggo 2.0 2006-2013 Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 2.0 2006", "Chery Tiggo 2.0 2007", "Chery Tiggo 2.0 2008", "Chery Tiggo 2.0 2013"], precio: 37.80, stock: 10 },
  { codigo: "PN6032", nombre: "Pastilla de Freno Chery Tiggo 3 1.6 2014-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 3 1.6 2014", "Chery Tiggo 3 1.6 2015", "Chery Tiggo 3 1.6 2016"], precio: 50.40, stock: 10 },
  { codigo: "PN6033", nombre: "Pastilla de Freno Chery Tiggo 5 2.0 2014-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 5 2.0 2014", "Chery Tiggo 5 2.0 2015", "Chery Tiggo 5 2.0 2016"], precio: 56.70, stock: 10 },
  { codigo: "PN6034", nombre: "Pastilla de Freno Chery Tiggo 5 2.0 2014-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 5 2.0 2014", "Chery Tiggo 5 2.0 2015", "Chery Tiggo 5 2.0 2016"], precio: 44.10, stock: 10 },
  { codigo: "PN6035", nombre: "Pastilla de Freno Chery Tiggo 7 1.5T 2018-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 7 1.5T 2018", "Chery Tiggo 7 1.5T 2019", "Chery Tiggo 7 1.5T 2020"], precio: 63.00, stock: 10 },
  { codigo: "PN6036", nombre: "Pastilla de Freno Chery Tiggo 7 1.5T 2018-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Chery Tiggo 7 1.5T 2018", "Chery Tiggo 7 1.5T 2019", "Chery Tiggo 7 1.5T 2020"], precio: 50.40, stock: 10 },
  { codigo: "PN6001", nombre: "Pastilla de Freno Toyota Hilux 2.4/2.8 2016-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Toyota Hilux 2.4 2016", "Toyota Hilux 2.4 2017", "Toyota Hilux 2.4 2018", "Toyota Hilux 2.8 2016", "Toyota Hilux 2.8 2017", "Toyota Hilux 2.8 2018"], precio: 75.60, stock: 10 },
  { codigo: "PN6002", nombre: "Pastilla de Freno Toyota Hilux 2.4/2.8 2016-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Toyota Hilux 2.4 2016", "Toyota Hilux 2.8 2016", "Toyota Hilux 2.4 2017", "Toyota Hilux 2.8 2017"], precio: 63.00, stock: 10 },
  { codigo: "PN6003", nombre: "Pastilla de Freno Toyota RAV4 2.0/2.5 2019-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Toyota RAV4 2.0 2019", "Toyota RAV4 2.5 2019", "Toyota RAV4 2.0 2020", "Toyota RAV4 2.5 2020"], precio: 75.60, stock: 10 },
  { codigo: "PN6004", nombre: "Pastilla de Freno Toyota RAV4 2.0/2.5 2019-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Toyota RAV4 2.0 2019", "Toyota RAV4 2.5 2019", "Toyota RAV4 2.5 2020"], precio: 63.00, stock: 10 },
  { codigo: "PN6005", nombre: "Pastilla de Freno Nissan NP300 2.5 2015-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Nissan NP300 2.5 2015", "Nissan NP300 2.5 2016", "Nissan NP300 2.5 2017", "Nissan NP300 2.5 2018"], precio: 63.00, stock: 10 },
  { codigo: "PN6006", nombre: "Pastilla de Freno Nissan NP300 2.5 2015-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Nissan NP300 2.5 2015", "Nissan NP300 2.5 2016", "Nissan NP300 2.5 2017"], precio: 50.40, stock: 10 },
  { codigo: "PN6007", nombre: "Pastilla de Freno Nissan X-Trail 2.0/2.5 2014-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Nissan X-Trail 2.0 2014", "Nissan X-Trail 2.5 2014", "Nissan X-Trail 2.0 2015", "Nissan X-Trail 2.5 2015"], precio: 63.00, stock: 10 },
  { codigo: "PN6008", nombre: "Pastilla de Freno Nissan X-Trail 2.0/2.5 2014-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Nissan X-Trail 2.0 2014", "Nissan X-Trail 2.5 2014", "Nissan X-Trail 2.5 2015"], precio: 50.40, stock: 10 },
  { codigo: "PN6009", nombre: "Pastilla de Freno Hyundai Tucson 2.0 2016-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Hyundai Tucson 2.0 2016", "Hyundai Tucson 2.0 2017", "Hyundai Tucson 2.0 2018", "Hyundai Tucson 2.0 2019"], precio: 63.00, stock: 10 },
  { codigo: "PN6010", nombre: "Pastilla de Freno Hyundai Tucson 2.0 2016-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Hyundai Tucson 2.0 2016", "Hyundai Tucson 2.0 2017", "Hyundai Tucson 2.0 2018"], precio: 50.40, stock: 10 },
  { codigo: "PN6011", nombre: "Pastilla de Freno Hyundai Santa Fe 2.4/2.2D 2013-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Hyundai Santa Fe 2.4 2013", "Hyundai Santa Fe 2.2D 2013", "Hyundai Santa Fe 2.4 2014"], precio: 69.30, stock: 10 },
  { codigo: "PN6012", nombre: "Pastilla de Freno Hyundai Santa Fe 2.4/2.2D 2013-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Hyundai Santa Fe 2.4 2013", "Hyundai Santa Fe 2.2D 2013"], precio: 56.70, stock: 10 },
  { codigo: "PN6013", nombre: "Pastilla de Freno Kia Sportage 2.0 2016-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Kia Sportage 2.0 2016", "Kia Sportage 2.0 2017", "Kia Sportage 2.0 2018", "Kia Sportage 2.0 2019"], precio: 63.00, stock: 10 },
  { codigo: "PN6014", nombre: "Pastilla de Freno Kia Sportage 2.0 2016-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Kia Sportage 2.0 2016", "Kia Sportage 2.0 2017", "Kia Sportage 2.0 2018"], precio: 50.40, stock: 10 },
  { codigo: "PN6015", nombre: "Pastilla de Freno Kia Sorento 2.4/2.2D 2015-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Kia Sorento 2.4 2015", "Kia Sorento 2.2D 2015", "Kia Sorento 2.4 2016"], precio: 69.30, stock: 10 },
  { codigo: "PN6016", nombre: "Pastilla de Freno Kia Sorento 2.4/2.2D 2015-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Kia Sorento 2.4 2015", "Kia Sorento 2.2D 2015"], precio: 56.70, stock: 10 },
  { codigo: "PN6017", nombre: "Pastilla de Freno JAC S3 1.5 2015-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["JAC S3 1.5 2015", "JAC S3 1.5 2016", "JAC S3 1.5 2017"], precio: 44.10, stock: 10 },
  { codigo: "PN6018", nombre: "Pastilla de Freno JAC S5 2.0T 2013-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["JAC S5 2.0T 2013", "JAC S5 2.0T 2014", "JAC S5 2.0T 2015"], precio: 50.40, stock: 10 },
  { codigo: "PN6019", nombre: "Pastilla de Freno JAC S5 2.0T 2013-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["JAC S5 2.0T 2013", "JAC S5 2.0T 2014", "JAC S5 2.0T 2015"], precio: 44.10, stock: 10 },
  { codigo: "PN6020", nombre: "Pastilla de Freno Mitsubishi L200 2.4D 2016-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Mitsubishi L200 2.4D 2016", "Mitsubishi L200 2.4D 2017", "Mitsubishi L200 2.4D 2018"], precio: 69.30, stock: 10 },
  { codigo: "PN6021", nombre: "Pastilla de Freno Mitsubishi L200 2.4D 2016-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Mitsubishi L200 2.4D 2016", "Mitsubishi L200 2.4D 2017"], precio: 56.70, stock: 10 },
  { codigo: "PN6022", nombre: "Pastilla de Freno Mitsubishi Outlander 2.4 2014-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Mitsubishi Outlander 2.4 2014", "Mitsubishi Outlander 2.4 2015", "Mitsubishi Outlander 2.4 2016"], precio: 63.00, stock: 10 },
  { codigo: "PN6023", nombre: "Pastilla de Freno Mitsubishi Outlander 2.4 2014-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Mitsubishi Outlander 2.4 2014", "Mitsubishi Outlander 2.4 2015"], precio: 50.40, stock: 10 },
  { codigo: "PN6024", nombre: "Pastilla de Freno Ford Ranger 2.2/3.2D 2012-UP Delantera", categoria: "Pastillas de Freno", modelosCompatibles: ["Ford Ranger 2.2D 2012", "Ford Ranger 3.2D 2012", "Ford Ranger 2.2D 2013", "Ford Ranger 3.2D 2013"], precio: 69.30, stock: 10 },
  { codigo: "PN6025", nombre: "Pastilla de Freno Ford Ranger 2.2/3.2D 2012-UP Posterior", categoria: "Pastillas de Freno", modelosCompatibles: ["Ford Ranger 2.2D 2012", "Ford Ranger 3.2D 2012"], precio: 56.70, stock: 10 },

  // === ZAPATAS DE FRENO ===
  { codigo: "ZN6001", nombre: "Zapata de Freno Toyota Hilux 2.4/2.8 2016-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Toyota Hilux 2.4 2016", "Toyota Hilux 2.8 2016", "Toyota Hilux 2.4 2017", "Toyota Hilux 2.8 2017"], precio: 56.70, stock: 10 },
  { codigo: "ZN6002", nombre: "Zapata de Freno Nissan NP300 2.5 2015-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Nissan NP300 2.5 2015", "Nissan NP300 2.5 2016", "Nissan NP300 2.5 2017"], precio: 50.40, stock: 10 },
  { codigo: "ZN6003", nombre: "Zapata de Freno Hyundai H1 2.5D 2007-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Hyundai H1 2.5D 2007", "Hyundai H1 2.5D 2008", "Hyundai H1 2.5D 2009", "Hyundai H1 2.5D 2010"], precio: 63.00, stock: 10 },
  { codigo: "ZN6004", nombre: "Zapata de Freno Chery Tiggo 2.0 2006-2013 Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Chery Tiggo 2.0 2006", "Chery Tiggo 2.0 2007", "Chery Tiggo 2.0 2008", "Chery Tiggo 2.0 2009"], precio: 37.80, stock: 10 },
  { codigo: "ZN6005", nombre: "Zapata de Freno JAC S3 1.5 2015-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["JAC S3 1.5 2015", "JAC S3 1.5 2016", "JAC S3 1.5 2017"], precio: 37.80, stock: 10 },
  { codigo: "ZN6006", nombre: "Zapata de Freno Changan CS35 1.6 2013-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Changan CS35 1.6 2013", "Changan CS35 1.6 2014", "Changan CS35 1.6 2015"], precio: 37.80, stock: 10 },
  { codigo: "ZN6007", nombre: "Zapata de Freno Mitsubishi L200 2.4D 2016-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Mitsubishi L200 2.4D 2016", "Mitsubishi L200 2.4D 2017"], precio: 50.40, stock: 10 },
  { codigo: "ZN6008", nombre: "Zapata de Freno Ford Ranger 2.2/3.2D 2012-UP Posterior", categoria: "Zapatas de Freno", modelosCompatibles: ["Ford Ranger 2.2D 2012", "Ford Ranger 3.2D 2012"], precio: 50.40, stock: 10 },
];

async function main() {
  const res = await fetch(`${BASE_URL}/api/admin/productos/importar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": ADMIN_COOKIE,
    },
    body: JSON.stringify({ productos }),
  });

  const data = await res.json();
  console.log("Resultado:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
