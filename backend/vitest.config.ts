import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // La base SQLite de test est partagée : les fichiers de tests
    // doivent s'exécuter séquentiellement (chacun remet la base à zéro).
    fileParallelism: false,
    globalSetup: "./tests/global-setup.ts",
    env: {
      // dotenv ne remplace pas une variable déjà présente : c'est bien
      // prisma/test.db qui sera utilisée par le client Prisma.
      DATABASE_URL: "file:./prisma/test.db",
    },
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});