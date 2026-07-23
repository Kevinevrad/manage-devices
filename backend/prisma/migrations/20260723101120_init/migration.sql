-- CreateTable
CREATE TABLE "Affectation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipementId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "dateDebut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" DATETIME,
    "commentaire" TEXT,
    CONSTRAINT "Affectation_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Affectation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "prix" TEXT NOT NULL,
    "numSerie" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'Non Affecté',
    "dateAchat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    CONSTRAINT "Equipement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LicencesSurEquipement" (
    "equipementId" INTEGER NOT NULL,
    "logicielId" INTEGER NOT NULL,
    "installeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("equipementId", "logicielId"),
    CONSTRAINT "LicencesSurEquipement_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LicencesSurEquipement_logicielId_fkey" FOREIGN KEY ("logicielId") REFERENCES "Logiciel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Logiciel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "editeur" TEXT NOT NULL,
    "cleLicence" TEXT NOT NULL,
    "dateAchat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExp" DATETIME NOT NULL,
    "typeLicence" TEXT NOT NULL DEFAULT 'Groupe'
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user'
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipement_numSerie_key" ON "Equipement"("numSerie");

-- CreateIndex
CREATE UNIQUE INDEX "Logiciel_cleLicence_key" ON "Logiciel"("cleLicence");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
