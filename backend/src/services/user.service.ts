import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import {
  ROLES_UTILISATEUR,
  type RoleUtilisateur,
} from "../domain/statuts";
import { ApiError } from "../utils/api-error";
import { hacherMotDePasse, motDePasseValide } from "../utils/auth";
import { entierOuIndefini } from "../utils/query";
import { emailObligatoire, texteObligatoire } from "../utils/validation";
import type { UtilisateurAuthentifie } from "../middlewares/auth.middleware";
import {
  contrainteOrganisation,
  verifierVisibilite,
} from "./tenant";
import { relationOrganisation, relationOrganisationCreation } from "./organisation.service";

/** Include Prisma : équipements rattachés + historique d'affectations. */
const includeComplet = {
  organisation: { select: { id: true, nom: true } },
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
  organisationId?: unknown;
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
function roleOptionnel(valeur: unknown): RoleUtilisateur | undefined {
  if (valeur === undefined || valeur === null) return undefined;
  const role = texteObligatoire(valeur, "role");
  if (!(ROLES_UTILISATEUR as readonly string[]).includes(role)) {
    throw ApiError.badRequest(
      `Le champ « role » doit être l'une des valeurs : ${ROLES_UTILISATEUR.join(", ")}.`,
    );
  }
  return role as RoleUtilisateur;
}

/** Liste les utilisateurs (filtre : ?organisationId=…). */
export async function listerUsers(
  query: Record<string, unknown>,
  utilisateur: UtilisateurAuthentifie,
) {
  const organisationId = entierOuIndefini(query.organisationId);

  const where: Prisma.UserWhereInput = {};
  if (organisationId !== undefined) where.organisationId = organisationId;
  // Isolation multi-tenant : prioritaire sur le filtre explicite
  const contrainte = contrainteOrganisation(utilisateur);
  if (contrainte !== undefined) where.organisationId = contrainte;

  const users = await prisma.user.findMany({
    where,
    include: includeComplet,
    orderBy: { id: "asc" },
  });
  return users.map(versDto);
}

/** Récupère un utilisateur par son identifiant (404 sinon, 404 hors tenant). */
export async function obtenirUser(
  id: number,
  utilisateur: UtilisateurAuthentifie,
) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: includeComplet,
  });
  if (user === null) {
    throw ApiError.notFound(`Utilisateur ${id} introuvable.`);
  }
  verifierVisibilite(user, utilisateur);
  return versDto(user);
}

/** Crée un utilisateur (l'e-mail doit être unique — 409 sinon). */
export async function creerUser(
  payload: UserPayload,
  utilisateur: UtilisateurAuthentifie,
) {
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

  // Rattachement à une organisation :
  // - utilisateur cloisonné → son organisation est imposée (payload ignoré) ;
  // - admin / non cloisonné → organisationId du payload (404 si inconnue).
  const contrainte = contrainteOrganisation(utilisateur);
  if (contrainte !== undefined) {
    data.organisation = { connect: { id: contrainte } };
  } else {
    const organisation = await relationOrganisationCreation(
      payload.organisationId,
    );
    if (organisation !== undefined) data.organisation = organisation;
  }

  const user = await prisma.user.create({ data, include: includeComplet });
  return versDto(user);
}

/** Met à jour partiellement un utilisateur. */
export async function modifierUser(
  id: number,
  payload: UserPayload,
  utilisateur: UtilisateurAuthentifie,
) {
  const existant = await prisma.user.findUnique({ where: { id } });
  if (existant === null) {
    throw ApiError.notFound(`Utilisateur ${id} introuvable.`);
  }
  verifierVisibilite(existant, utilisateur);
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

  // Ré-rattachement ou détachement (organisationId: null) d'organisation
  const organisation = await relationOrganisation(payload.organisationId);
  if (organisation !== undefined) data.organisation = organisation;

  const user = await prisma.user.update({
    where: { id },
    data,
    include: includeComplet,
  });
  return versDto(user);
}

/** Supprime un utilisateur (ses équipements repassent « sans utilisateur »). */
export async function supprimerUser(
  id: number,
  utilisateur: UtilisateurAuthentifie,
) {
  const existant = await prisma.user.findUnique({ where: { id } });
  if (existant === null) {
    throw ApiError.notFound(`Utilisateur ${id} introuvable.`);
  }
  verifierVisibilite(existant, utilisateur);
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
    organisation: user.organisation,
    equipements: user.equipements,
    historiquesAffectations: user.historiquesAffectations,
    _count: user._count,
  };
}