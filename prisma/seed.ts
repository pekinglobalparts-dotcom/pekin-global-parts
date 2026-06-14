import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.administrador.findUnique({ where: { email: "pekinglobalparts@gmail.com" } });
  if (!existing) {
    await prisma.administrador.create({
      data: {
        nombre: "Admin",
        apellido: "Pekin",
        email: "pekinglobalparts@gmail.com",
        passwordHash: await bcrypt.hash("PekinAdmin2025!", 12),
        role: "SUPER_ADMIN",
      },
    });
    console.log("✓ Admin creado: pekinglobalparts@gmail.com / PekinAdmin2025!");
  } else {
    console.log("✓ Admin ya existe");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
