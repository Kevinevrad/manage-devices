-- Ajout du modèle multi-tenant Organisation :
-- - unicité du nom sur la table Organisation (déjà créée par la migration
--   20260831114708_align_parc_et_licences) ;
-- - colonne organisationId (nullable, ON DELETE SET NULL) sur User, Equipement, Logiciel.

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_nom_key" ON "Organisation"("nom");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- User : ajout de organisationId
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "organisationId" INTEGER,
    CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id", "motDePasse", "nom", "prenom", "role", "service", "structure") SELECT "email", "id", "motDePasse", "nom", "prenom", "role", "service", "structure" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Equipement : ajout de organisationId
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
    "organisationId" INTEGER,
    CONSTRAINT "Equipement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipement" ("dateAchat", "id", "marque", "nom", "numSerie", "prix", "statut", "type", "userId") SELECT "dateAchat", "id", "marque", "nom", "numSerie", "prix", "statut", "type", "userId" FROM "Equipement";
DROP TABLE "Equipement";
ALTER TABLE "new_Equipement" RENAME TO "Equipement";
CREATE UNIQUE INDEX "Equipement_numSerie_key" ON "Equipement"("numSerie");

-- Logiciel : ajout de organisationId
CREATE TABLE "new_Logiciel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "editeur" TEXT NOT NULL,
    "cleLicence" TEXT NOT NULL,
    "dateAchat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExp" DATETIME,
    "typeLicence" TEXT NOT NULL DEFAULT 'Abonnement',
    "siegesTotal" INTEGER,
    "coutAnnuel" REAL,
    "organisationId" INTEGER,
    CONSTRAINT "Logiciel_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Logiciel" ("cleLicence", "coutAnnuel", "dateAchat", "dateExp", "editeur", "id", "nom", "siegesTotal", "typeLicence") SELECT "cleLicence", "coutAnnuel", "dateAchat", "dateExp", "editeur", "id", "nom", "siegesTotal", "typeLicence" FROM "Logiciel";
DROP TABLE "Logiciel";
ALTER TABLE "new_Logiciel" RENAME TO "Logiciel";
CREATE UNIQUE INDEX "Logiciel_cleLicence_key" ON "Logiciel"("cleLicence");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
