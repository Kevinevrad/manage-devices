import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import process from "process";

/**
 * Prépare l'environnement de test : base SQLite neuve (prisma/test.db)
 * avec l'ensemble des migrations appliquées. Exécuté une fois avant
 * l'ensemble des fichiers de tests.
 */
export default function preparerBaseTest() {
  rmSync("prisma/test.db", { force: true });
  rmSync("prisma/test.db-journal", { force: true });

  const resultat = spawnSync("npm run db:deploy", {
    shell: true,
    stdio: "inherit",
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
  });
  if (resultat.status !== 0) {
    throw new Error(
      "Échec de l'application des migrations sur la base de test (prisma/test.db).",
    );
  }
}