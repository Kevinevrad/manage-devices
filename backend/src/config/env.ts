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

export { JWT_SECRET, JWT_EXPIRE_IN };