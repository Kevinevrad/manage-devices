import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Pointe vers le dossier global 'prisma' contenant tous vos fichiers .prisma
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // La variable d'environnement ou le chemin direct est géré ici
    url: env("DATABASE_URL"),
  },
});
