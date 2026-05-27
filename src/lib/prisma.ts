// Carga las variables del archivo .env.
// Así podemos usar process.env.DATABASE_URL.
import "dotenv/config";

// Adapter necesario para usar SQLite con Prisma 7.
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Importamos PrismaClient desde el cliente generado por Prisma.
import { PrismaClient } from "../generated/prisma/client.js";

// Tomamos la URL de la base de datos desde .env.
// Si no existe, usamos una URL por defecto para desarrollo.
const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";

// Creamos el adapter de SQLite.
// Prisma 7 necesita este adapter para conectarse a la base.
const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

// Creamos una sola instancia de PrismaClient.
// Esta instancia se reutiliza en los services.
export const prisma = new PrismaClient({
  adapter,
});