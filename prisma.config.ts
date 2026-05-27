// Carga las variables del archivo .env.
import "dotenv/config";

// defineConfig ayuda a configurar Prisma CLI de forma tipada.
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Le indica a Prisma dónde está el schema.
  schema: "prisma/schema.prisma",

  // Le indica a Prisma dónde guardar las migraciones
  // y qué comando ejecutar cuando corramos npx prisma db seed.
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  // En Prisma 7, la URL de conexión va acá.
  datasource: {
    url: env("DATABASE_URL"),
  },
});