import "dotenv/config";
import process from "process";

/**
 * Configuration de l'authentification (JWT).
 * En développement, une valeur par défaut évite de planter si .env est absent —
 * en production, JWT_SECRET DOIT être défini (voir .env.example).
 */
const JWT_SECRET: string =
  process.env.JWT_SECRET ?? "dev-secret-manage-device-a-changer";

/** Durée de validité des jetons de session. */
const JWT_EXPIRE_IN: string = process.env.JWT_EXPIRE_IN ?? "7d";

/**
 * Origines autorisées pour CORS (séparées par des virgules).
 * Défaut : le serveur de développement Vite. En production, définir
 * CORS_ORIGIN avec l'URL publique du frontend (voir .env.example).
 */
const CORS_ORIGINS: string[] = (
  process.env.CORS_ORIGIN ?? "http://localhost:5173"
)
  .split(",")
  .map((origine) => origine.trim())
  .filter((origine) => origine.length > 0);

export { JWT_SECRET, JWT_EXPIRE_IN, CORS_ORIGINS };