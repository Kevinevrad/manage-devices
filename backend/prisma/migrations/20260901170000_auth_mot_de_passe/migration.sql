-- Ajout du hash bcrypt pour l'authentification.
-- La table est vide au moment de la migration (rejeu sur base neuve) :
-- NOT NULL sans défaut est donc accepté par SQLite.
ALTER TABLE "User" ADD COLUMN "motDePasse" TEXT NOT NULL;
