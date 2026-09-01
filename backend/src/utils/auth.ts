import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRE_IN, JWT_SECRET } from "../config/env";
import { ApiError } from "./api-error";
import { texteObligatoire } from "./validation";

/** Coût bcrypt : bon compromis sécurité / performance. */
const COUT_BCRYPT = 10;

/** Force minimale du mot de passe (8 caractères). */
export function motDePasseValide(valeur: unknown): string {
  const motDePasse = texteObligatoire(valeur, "motDePasse");
  if (motDePasse.length < 8) {
    throw ApiError.badRequest(
      "Le champ « motDePasse » doit contenir au moins 8 caractères.",
    );
  }
  return motDePasse;
}

/** Hache un mot de passe en clair (bcrypt). */
export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  return bcrypt.hash(motDePasse, COUT_BCRYPT);
}

/** Compare un mot de passe en clair avec son hash. */
export async function verifierMotDePasse(
  motDePasse: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(motDePasse, hash);
}

/** Charge utile stockée dans le JWT. */
export interface ChargeUtileJetton {
  id: number;
  role: string;
}

/** Signe un JWT de session pour l'utilisateur donné. */
export function signerJetton(utilisateur: {
  id: number;
  role: string;
}): string {
  const options: jwt.SignOptions = {
    subject: String(utilisateur.id),
  };
  if (JWT_EXPIRE_IN !== "") {
    // Durée lue depuis l'env (ex: "7d") — conversion vers le type attendu
    options.expiresIn = JWT_EXPIRE_IN as unknown as NonNullable<
      jwt.SignOptions["expiresIn"]
    >;
  }
  return jwt.sign({ role: utilisateur.role }, JWT_SECRET, options);
}

/** Vérifie un JWT et retourne sa charge utile (401 sinon). */
export function verifierJetton(jetton: string): ChargeUtileJetton {
  try {
    const charge = jwt.verify(jetton, JWT_SECRET);
    if (typeof charge === "string") {
      throw new Error("Charge utile invalide.");
    }
    const id = Number(charge.sub);
    const role = charge.role;
    if (!Number.isInteger(id) || id <= 0 || typeof role !== "string") {
      throw new Error("Charge utile incomplète.");
    }
    return { id, role };
  } catch {
    throw ApiError.unauthorized(
      "Session invalide ou expirée. Reconnectez-vous.",
    );
  }
}