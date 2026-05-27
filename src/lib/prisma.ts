// Carga las variables del archivo .env.
// Así podemos usar process.env.DATABASE_URL.
import "dotenv/config";

// Adapter necesario para usar PostgreSQL con Prisma 7.
import { PrismaPg } from "@prisma/adapter-pg";

// Importamos PrismaClient desde el cliente generado por Prisma.
import { PrismaClient } from "../generated/prisma/client.js";

// Tomamos la URL de PostgreSQL desde .env.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

// Creamos el adapter de PostgreSQL.
// Prisma 7 necesita un adapter para conectarse directamente a la base.
const adapter = new PrismaPg({
  connectionString,
});

// Creamos una sola instancia de PrismaClient.
// Esta instancia se reutiliza en los services.
export const prisma = new PrismaClient({
  adapter,
});