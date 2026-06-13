import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.administrador.upsert({
    where: { email: "admin@pekin.com.pe" },
    update: {},
    create: {
      nombre: "Oscar",
      apellido: "Ruiz",
      email: "admin@pekin.com.pe",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  const categorias = [
    { nombre: "Frenos", slug: "frenos", orden: 1 },
    { nombre: "Motor", slug: "motor", orden: 2 },
    { nombre: "Suspensión", slug: "suspension", orden: 3 },
    { nombre: "Eléctrico", slug: "electrico", orden: 4 },
    { nombre: "Transmisión", slug: "transmision", orden: 5 },
    { nombre: "Carrocería", slug: "carroceria", orden: 6 },
    { nombre: "Filtros", slug: "filtros", orden: 7 },
    { nombre: "Refrigeración", slug: "refrigeracion", orden: 8 },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const marcas = [
    "Toyota", "Nissan", "Hyundai", "Kia",
    "Mitsubishi", "Ford", "Chevrolet", "Volkswagen",
  ];

  for (const nombre of marcas) {
    await prisma.marca.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const frenos = await prisma.categoria.findUnique({ where: { slug: "frenos" } });
  const motor = await prisma.categoria.findUnique({ where: { slug: "motor" } });
  const filtros = await prisma.categoria.findUnique({ where: { slug: "filtros" } });
  const toyota = await prisma.marca.findUnique({ where: { nombre: "Toyota" } });
  const nissan = await prisma.marca.findUnique({ where: { nombre: "Nissan" } });
  const hyundai = await prisma.marca.findUnique({ where: { nombre: "Hyundai" } });

  if (frenos && motor && filtros && toyota && nissan && hyundai) {
    const productos = [
      {
        codigo: "PKN-FR-001",
        nombre: "Pastillas de freno delanteras Toyota Hilux",
        descripcion: "Pastillas de freno de alta resistencia para Toyota Hilux 2018-2024",
        categoriaId: frenos.id,
        marcaId: toyota.id,
        modelosCompatibles: ["Hilux 2018", "Hilux 2019", "Hilux 2020", "Hilux 2021", "Hilux 2022"],
        precio: 185.00,
        stock: 45,
        destacado: true,
      },
      {
        codigo: "PKN-MT-001",
        nombre: "Filtro de aceite Toyota Land Cruiser",
        descripcion: "Filtro de aceite original compatible Toyota Land Cruiser 200",
        categoriaId: filtros.id,
        marcaId: toyota.id,
        modelosCompatibles: ["Land Cruiser 200", "Land Cruiser Prado"],
        precio: 65.00,
        stock: 120,
        destacado: true,
      },
      {
        codigo: "PKN-FR-002",
        nombre: "Disco de freno Nissan Frontier",
        descripcion: "Disco de freno ventilado para Nissan Frontier 4x4",
        categoriaId: frenos.id,
        marcaId: nissan.id,
        modelosCompatibles: ["Frontier 2016", "Frontier 2017", "Frontier 2018"],
        precio: 320.00,
        stock: 28,
        destacado: true,
      },
      {
        codigo: "PKN-MT-002",
        nombre: "Bujía de encendido Hyundai Tucson",
        descripcion: "Bujía de iridio de larga duración para Hyundai Tucson 2.0L",
        categoriaId: motor.id,
        marcaId: hyundai.id,
        modelosCompatibles: ["Tucson 2017", "Tucson 2018", "Tucson 2019", "Tucson 2020"],
        precio: 45.00,
        stock: 200,
        destacado: false,
      },
      {
        codigo: "PKN-FL-001",
        nombre: "Filtro de aire Toyota Hilux",
        descripcion: "Filtro de aire de alto flujo para Toyota Hilux diesel",
        categoriaId: filtros.id,
        marcaId: toyota.id,
        modelosCompatibles: ["Hilux 2015", "Hilux 2016", "Hilux 2017", "Hilux 2018"],
        precio: 89.00,
        stock: 75,
        destacado: false,
      },
      {
        codigo: "PKN-FR-003",
        nombre: "Kit de frenos completo Nissan Navara",
        descripcion: "Kit completo: pastillas + discos + líquido de frenos",
        categoriaId: frenos.id,
        marcaId: nissan.id,
        modelosCompatibles: ["Navara 2015", "Navara 2016", "Navara 2017", "Navara 2018"],
        precio: 750.00,
        stock: 15,
        destacado: true,
      },
    ];

    for (const prod of productos) {
      await prisma.producto.upsert({
        where: { codigo: prod.codigo },
        update: {},
        create: prod,
      });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
