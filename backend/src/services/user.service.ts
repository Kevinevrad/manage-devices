import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { hacherMotDePasse, motDePasseValide } from "../utils/auth";
import { emailObligatoire, texteObligatoire } from "../utils/validation";

/** Rôles autorisés pour un utilisateur. */
const ROLES = ["user", "admin", "technicien"] as const;

/** Include Prisma : équipements rattachés + historique d'affectations. */
const includeComplet = {
  equipements: true,
  historiquesAffectations: true,
  _count: { select: { equipements: true, historiquesAffectations: true } },
} satisfies Prisma.UserInclude;

type UserComplet = Prisma.UserGetPayload<{ include: typeof includeComplet }>;

interface UserPayload {
  nom?: unknown;
  prenom?: unknown;
  email?: unknown;
  motDePasse?: unknown;
  structure?: unknown;
  service?: unknown;
  role?: unknown;
}

/**
 * Vérifie qu'un utilisateur existe et le retourne.
 * Utilisé aussi par les services equipement et affectation.
 */
export async function verifierUtilisateur(id: number) {
  const utilisateur = await prisma.user.findUnique({ where: { id } });
  if (utilisateur === null) {
    throw ApiError.badRequest(`Utilisateur ${id} introuvable.`);
  }
  return utilisateur;
}

/** Valide une adresse e-mail simple (texte@domaine.tld). */
function validerEmail(valeur: unknown, champ: string): string {
  return emailObligatoire(valeur, champ);
}

/** Valide le rôle s'il est fourni. */
function roleOptionnel(valeur: unknown): string | undefined {
  if (valeur === undefined || valeur === null) return undefined;
  const role = texteObligatoire(valeur, "role");
  if (!(ROLES as readonly string[]).includes(role)) {
    throw ApiError.badRequest(
      `Le champ « role » doit être l'une des valeurs : ${ROLES.join(", ")}.`,
    );
  }
  return role;
}

/** Liste les utilisateurs avec le nombre d'équipements rattachés. */
export async function listerUsers() {
  const users = await prisma.user.findMany({
    include: includeComplet,
    orderBy: { id: "asc" },
  });
  return users.map(versDto);
}

/** Récupère un utilisateur par son identifiant (404 sinon). */
export async function obtenirUser(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: includeComplet,
  });
  if (user === null) {
    throw ApiError.notFound(`Utilisateur ${id} introuvable.`);
  }
  return versDto(user);
}

/** Crée un utilisateur (l'e-mail doit être unique — 409 sinon). */
export async function creerUser(payload: UserPayload) {
  const data: Prisma.UserCreateInput = {
    nom: texteObligatoire(payload.nom, "nom"),
    prenom: texteObligatoire(payload.prenom, "prenom"),
    email: validerEmail(payload.email, "email"),
    // Mot de passe initial (hashé) — requis pour la connexion
    motDePasse: await hacherMotDePasse(motDePasseValide(payload.motDePasse)),
    structure: texteObligatoire(payload.structure, "structure"),
    service: texteObligatoire(payload.service, "service"),
  };
  const role = roleOptionnel(payload.role);
  if (role !== undefined) data.role = role;

  const user = await prisma.user.create({ data, include: includeComplet });
  return versDto(user);
}

/** Met à jour partiellement un utilisateur. */
export async function modifierUser(id: number, payload: UserPayload) {
  await verifierExistence(id);
  const data: Prisma.UserUpdateInput = {};

  if (payload.nom !== undefined) data.nom = texteObligatoire(payload.nom, "nom");
  if (payload.prenom !== undefined) {
    data.prenom = texteObligatoire(payload.prenom, "prenom");
  }
  if (payload.email !== undefined) {
    data.email = validerEmail(payload.email, "email");
  }
  if (payload.structure !== undefined) {
    data.structure = texteObligatoire(payload.structure, "structure");
  }
  if (payload.service !== undefined) {
    data.service = texteObligatoire(payload.service, "service");
  }
  const role = roleOptionnel(payload.role);
  if (role !== undefined) data.role = role;

  const user = await prisma.user.update({
    where: { id },
    data,
    include: includeComplet,
  });
  return versDto(user);
}

/** Supprime un utilisateur (ses équipements repassent « sans utilisateur »). */
export async function supprimerUser(id: number) {
  await verifierExistence(id);
  await prisma.user.delete({ where: { id } }); // Equipement.userId passe à NULL (ON DELETE SET NULL)
}

// ---------------------------------------------------------------- Utilitaires

async function verifierExistence(id: number) {
  const existant = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (existant === null) {
    throw ApiError.notFound(`Utilisateur ${id} introuvable.`);
  }
}

/** Ajoute le nom complet calculé pour faciliter l'affichage côté frontend. */
function versDto(user: UserComplet) {
  return {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    structure: user.structure,
    service: user.service,
    role: user.role,
    nomComplet: `${user.prenom} ${user.nom}`,
    equipements: user.equipements,
    historiquesAffectations: user.historiquesAffectations,
    _count: user._count,
  };
}