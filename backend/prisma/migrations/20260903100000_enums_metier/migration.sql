-- Conversion des métier en valeurs d'enum (identifiants ASCII) :
-- les enums Prisma n'autorisent ni espaces ni accents. Une couche de
-- mapping dans src/domain/statuts.ts réexpose les libellés français.

-- Statuts des équipements
UPDATE "Equipement" SET "statut" = 'Non_Affecte' WHERE "statut" = 'Non Affecté';
UPDATE "Equipement" SET "statut" = 'En_service' WHERE "statut" = 'En service';
UPDATE "Equipement" SET "statut" = 'En_stock' WHERE "statut" = 'En stock';
UPDATE "Equipement" SET "statut" = 'En_panne' WHERE "statut" = 'En panne';

-- Types de licence
UPDATE "Logiciel" SET "typeLicence" = 'Perpetuelle' WHERE "typeLicence" = 'Perpétuelle';

-- RedefineTables : le défaut de Equipement.statut devient 'Non_Affecte'
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "numSerie" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'Non_Affecte',
    "dateAchat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "organisationId" INTEGER,
    CONSTRAINT "Equipement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipement" ("dateAchat", "id", "marque", "nom", "numSerie", "organisationId", "prix", "statut", "type", "userId") SELECT "dateAchat", "id", "marque", "nom", "numSerie", "organisationId", "prix", "statut", "type", "userId" FROM "Equipement";
DROP TABLE "Equipement";
ALTER TABLE "new_Equipement" RENAME TO "Equipement";
CREATE UNIQUE INDEX "Equipement_numSerie_key" ON "Equipement"("numSerie");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
