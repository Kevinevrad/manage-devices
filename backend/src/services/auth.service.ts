import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import {
  hacherMotDePasse,
  signerJetton,
  verifierMotDePasse,
} from "../utils/auth";
import { emailObligatoire, texteObligatoire } from "../utils/validation";

interface InscriptionPayload {
  nom?: unknown;
  prenom?: unknown;
  email?: unknown;
  motDePasse?: unknown;
  structure?: unknown;
  service?: unknown;
}

interface ConnexionPayload {
  email?: unknown;
  motDePasse?: unknown;
}

/** Utilisateur exposé par l'API (jamais le hash du mot de passe). */
export interface UtilisateurPublic {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  structure: string;
  service: string;
  role: string;
  nomComplet: string;
}

/** Réponse des endpoints /auth : profil + jeton de session. */
export interface ReponseAuth {
  utilisateur: UtilisateurPublic;
  jetton: string;
}

/** Force minimale du mot de passe. */
function motDePasseValide(valeur: unknown): string {
  const motDePasse = texteObligatoire(valeur, "motDePasse");
  if (motDePasse.length < 8) {
    throw ApiError.badRequest(
      "Le champ « motDePasse » doit contenir au moins 8 caractères.",
    );
  }
  return motDePasse;
}

/** Retire le hash du mot de passe et ajoute le nom complet. */
function versUtilisateurPublic(utilisateur: {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  structure: string;
  service: string;
  role: string;
}): UtilisateurPublic {
  return {
    id: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    structure: utilisateur.structure,
    service: utilisateur.service,
    role: utilisateur.role,
    nomComplet: `${utilisateur.prenom} ${utilisateur.nom}`,
  };
}

/**
 * Inscrit un nouvel utilisateur : mot de passe haché, rôle forcé à « user »
 * (pas d'auto-promotion). L'e-mail doit être unique — 409 sinon.
 */
export async function inscrire(payload: InscriptionPayload): Promise<ReponseAuth> {
  const motDePasse = motDePasseValide(payload.motDePasse);
  const utilisateur = await prisma.user.create({
    data: {
      nom: texteObligatoire(payload.nom, "nom"),
      prenom: texteObligatoire(payload.prenom, "prenom"),
      email: emailObligatoire(payload.email, "email"),
      motDePasse: await hacherMotDePasse(motDePasse),
      structure: texteObligatoire(payload.structure, "structure"),
      service: texteObligatoire(payload.service, "service"),
      role: "user",
    },
  });
  return {
    utilisateur: versUtilisateurPublic(utilisateur),
    jetton: signerJetton(utilisateur),
  };
}

/** Connecte un utilisateur : vérification bcrypt puis signature du JWT. */
export async function connecter(payload: ConnexionPayload): Promise<ReponseAuth> {
  const email = texteObligatoire(payload.email, "email");
  const motDePasse = texteObligatoire(payload.motDePasse, "motDePasse");

  const utilisateur = await prisma.user.findUnique({ where: { email } });
  // Message volontairement générique : ne révèle pas si le compte existe.
  if (
    utilisateur === null ||
    !(await verifierMotDePasse(motDePasse, utilisateur.motDePasse))
  ) {
    throw ApiError.unauthorized("E-mail ou mot de passe incorrect.");
  }
  return {
    utilisateur: versUtilisateurPublic(utilisateur),
    jetton: signerJetton(utilisateur),
  };
}

/** Profil de l'utilisateur authentifié (id issu du JWT). */
export async function moi(id: number): Promise<UtilisateurPublic> {
  const utilisateur = await prisma.user.findUnique({ where: { id } });
  if (utilisateur === null) {
    throw ApiError.notFound("Utilisateur introuvable.");
  }
  return versUtilisateurPublic(utilisateur);
}