import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { entierObligatoire, texteObligatoire } from "../utils/validation";

/** Include Prisma : volumétrie des entités rattachées. */
const includeComplet = {
  _count: { select: { users: true, equipements: true, logiciels: true } },
} satisfies Prisma.OrganisationInclude;

type OrganisationComplet = Prisma.OrganisationGetPayload<{
  include: typeof includeComplet;
}>;

interface OrganisationPayload {
  nom?: unknown;
}

/** Vérifie qu'une organisation existe (404 sinon). */
export async function verifierOrganisation(id: number) {
  const organisation = await prisma.organisation.findUnique({ where: { id } });
  if (organisation === null) {
    throw ApiError.notFound(`Organisation ${id} introuvable.`);
  }
  return organisation;
}

/** Liste les organisations avec leurs volumétries. */
export async function listerOrganisations() {
  const organisations = await prisma.organisation.findMany({
    include: includeComplet,
    orderBy: { id: "asc" },
  });
  return organisations.map(versDto);
}

/** Récupère une organisation par son identifiant (404 sinon). */
export async function obtenirOrganisation(id: number) {
  const organisation = await prisma.organisation.findUnique({
    where: { id },
    include: includeComplet,
  });
  if (organisation === null) {
    throw ApiError.notFound(`Organisation ${id} introuvable.`);
  }
  return versDto(organisation);
}

/** Crée une organisation (le nom doit être unique — 409 sinon). */
export async function creerOrganisation(payload: OrganisationPayload) {
  const organisation = await prisma.organisation.create({
    data: { nom: texteObligatoire(payload.nom, "nom") },
    include: includeComplet,
  });
  return versDto(organisation);
}

/** Met à jour partiellement une organisation. */
export async function modifierOrganisation(
  id: number,
  payload: OrganisationPayload,
) {
  await verifierOrganisation(id);
  const data: Prisma.OrganisationUpdateInput = {};
  if (payload.nom !== undefined) {
    data.nom = texteObligatoire(payload.nom, "nom");
  }
  const organisation = await prisma.organisation.update({
    where: { id },
    data,
    include: includeComplet,
  });
  return versDto(organisation);
}

/**
 * Supprime une organisation.
 * Les entités rattachées sont conservées mais détachées (organisationId → null).
 */
export async function supprimerOrganisation(id: number) {
  await verifierOrganisation(id);
  await prisma.organisation.delete({ where: { id } });
}

/**
 * Construit la branche de relation Prisma pour un payload `organisationId` :
 * - valeur fournie → `{ connect }` après vérification (404 sinon) ;
 * - `null` → `{ disconnect: true }` (détachement) ;
 * - `undefined` → `undefined` (champ non modifié).
 * Réutilisée par les services user / equipement / logiciel.
 */
export async function relationOrganisation(
  payloadId: unknown,
): Promise<{ connect: { id: number } } | { disconnect: true } | undefined> {
  if (payloadId === undefined) return undefined;
  if (payloadId === null) return { disconnect: true };
  const organisationId = entierObligatoire(payloadId, "organisationId");
  await verifierOrganisation(organisationId);
  return { connect: { id: organisationId } };
}

/**
 * Variante pour la CRÉATION : un `organisationId: null` est traité comme une
 * absence (l'entité naît sans organisation) — `{ disconnect }` n'existe pas
 * dans les inputs de création Prisma.
 */
export async function relationOrganisationCreation(
  payloadId: unknown,
): Promise<{ connect: { id: number } } | undefined> {
  if (payloadId === undefined || payloadId === null) return undefined;
  const organisationId = entierObligatoire(payloadId, "organisationId");
  await verifierOrganisation(organisationId);
  return { connect: { id: organisationId } };
}

// ---------------------------------------------------------------- Utilitaires

/** DTO synthétique avec les volumétries des entités rattachées. */
function versDto(organisation: OrganisationComplet) {
  return {
    id: organisation.id,
    nom: organisation.nom,
    utilisateurs: organisation._count.users,
    equipements: organisation._count.equipements,
    logiciels: organisation._count.logiciels,
  };
}