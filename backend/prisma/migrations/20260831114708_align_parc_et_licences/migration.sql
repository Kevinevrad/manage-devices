/*
  Warnings:

  - You are about to alter the column `prix` on the `Equipement` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- CreateTable
CREATE TABLE "Organisation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "numSerie" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'Non Affecté',
    "dateAchat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    CONSTRAINT "Equipement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipement" ("dateAchat", "id", "marque", "nom", "numSerie", "prix", "statut", "type", "userId") SELECT "dateAchat", "id", "marque", "nom", "numSerie", "prix", "statut", "type", "userId" FROM "Equipement";
DROP TABLE "Equipement";
ALTER TABLE "new_Equipement" RENAME TO "Equipement";
CREATE UNIQUE INDEX "Equipement_numSerie_key" ON "Equipement"("numSerie");
CREATE TABLE "new_Logiciel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "editeur" TEXT NOT NULL,
    "cleLicence" TEXT NOT NULL,
    "dateAchat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExp" DATETIME,
    "typeLicence" TEXT NOT NULL DEFAULT 'Abonnement',
    "siegesTotal" INTEGER,
    "coutAnnuel" REAL
);
INSERT INTO "new_Logiciel" ("cleLicence", "dateAchat", "dateExp", "editeur", "id", "nom", "typeLicence") SELECT "cleLicence", "dateAchat", "dateExp", "editeur", "id", "nom", "typeLicence" FROM "Logiciel";
DROP TABLE "Logiciel";
ALTER TABLE "new_Logiciel" RENAME TO "Logiciel";
CREATE UNIQUE INDEX "Logiciel_cleLicence_key" ON "Logiciel"("cleLicence");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
