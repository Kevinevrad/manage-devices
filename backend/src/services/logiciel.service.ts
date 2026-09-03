import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import {
  TypeLicence,
  libelleDepuisTypeLicence,
  libellesTypeLicence,
  typeLicenceDepuisLibelle,
} from "../domain/statuts";
import { ApiError } from "../utils/api-error";
import { entierOuIndefini, premierTexte } from "../utils/query";
import {
  dateOptionnelle,
  entierObligatoire,
  nombreObligatoire,
  texteObligatoire,
} from "../utils/validation";
import {
  relationOrganisation,
  relationOrganisationCreation,
} from "./organisation.service";

/** Include Prisma : nombre d'installations (= sièges utilisés). */
const includeComplet = {
  organisation: { select: { id: true, nom: true } },
  _count: { select: { affectations: true } },
} satisfies Prisma.LogicielInclude;

type LogicielComplet = Prisma.LogicielGetPayload<{
  include: typeof includeComplet;
}>;

interface LogicielPayload {
  nom?: unknown;
  editeur?: unknown;
  cleLicence?: unknown;
  typeLicence?: unknown;
  siegesTotal?: unknown;
  coutAnnuel?: unknown;
  dateAchat?: unknown;
  dateExp?: unknown;
  organisationId?: unknown;
}

/** Vérifie qu'un logiciel existe (404 sinon). */
export async function verifierLogiciel(id: number) {
  const logiciel = await prisma.logiciel.findUnique({ where: { id } });
  if (logiciel === null) {
    throw ApiError.notFound(`Logiciel ${id} introuvable.`);
  }
  return logiciel;
}

/**
 * Liste les logiciels (licences).
 * Filtres : ?type=… (Abonnement / Perpétuelle) &q=… &expireSous=… (jours)
 * &organisationId=…
 */
export async function listerLogiciels(query: Record<string, unknown>) {
  const typeLabel = premierTexte(query.type);
  const typeFiltre =
    typeLabel === undefined ? undefined : typeLicenceDepuisLibelle(typeLabel);
  if (typeLabel !== undefined && typeFiltre === undefined) {
    throw ApiError.badRequest(
      `Le filtre « type » doit être l'une des valeurs : ${libellesTypeLicence().join(", ")}.`,
    );
  }
  const recherche = premierTexte(query.q);
  const expireSous = premierTexte(query.expireSous);
  const organisationId = entierOuIndefini(query.organisationId);

  const where: Prisma.LogicielWhereInput = {};
  if (typeFiltre !== undefined) where.typeLicence = typeFiltre;
  if (organisationId !== undefined) where.organisationId = organisationId;
  if (recherche !== undefined) {
    where.OR = [
      { nom: { contains: recherche } },
      { editeur: { contains: recherche } },
      { cleLicence: { contains: recherche } },
    ];
  }
  // Licences expirant dans les X prochains jours
  if (expireSous !== undefined) {
    const jours = entierObligatoire(expireSous, "expireSous");
    where.dateExp = {
      gte: new Date(),
      lte: new Date(Date.now() + jours * 86_400_000),
    };
  }

  const logiciels = await prisma.logiciel.findMany({
    where,
    include: includeComplet,
    orderBy: { id: "asc" },
  });
  return logiciels.map(versDto);
}

/** Récupère un logiciel (avec la liste de ses installations). */
export async function obtenirLogiciel(id: number) {
  const logiciel = await prisma.logiciel.findUnique({
    where: { id },
    include: {
      ...includeComplet,
      affectations: { include: { equipement: true } },
    },
  });
  if (logiciel === null) {
    throw ApiError.notFound(`Logiciel ${id} introuvable.`);
  }
  return {
    ...versDto(logiciel),
    installations: logiciel.affectations.map((installation) => ({
      equipementId: installation.equipementId,
      installeLe: installation.installeLe,
      equipement: {
        id: installation.equipement.id,
        nom: installation.equipement.nom,
        numSerie: installation.equipement.numSerie,
      },
    })),
  };
}

/** Crée un logiciel (la clé de licence doit être unique — 409 sinon). */
export async function creerLogiciel(payload: LogicielPayload) {
  const data = await validerCreation(payload);
  const logiciel = await prisma.logiciel.create({
    data,
    include: includeComplet,
  });
  return versDto(logiciel);
}

/** Met à jour partiellement un logiciel. */
export async function modifierLogiciel(id: number, payload: LogicielPayload) {
  await verifierLogiciel(id);
  const data: Prisma.LogicielUpdateInput = {};

  if (payload.nom !== undefined) data.nom = texteObligatoire(payload.nom, "nom");
  if (payload.editeur !== undefined) {
    data.editeur = texteObligatoire(payload.editeur, "editeur");
  }
  if (payload.cleLicence !== undefined) {
    data.cleLicence = texteObligatoire(payload.cleLicence, "cleLicence");
  }
  const type = typeOptionnel(payload.typeLicence);
  if (type !== undefined) data.typeLicence = type;
  if (payload.siegesTotal !== undefined) {
    data.siegesTotal =
      payload.siegesTotal === null
        ? null
        : entierObligatoire(payload.siegesTotal, "siegesTotal");
  }
  if (payload.coutAnnuel !== undefined) {
    data.coutAnnuel =
      payload.coutAnnuel === null
        ? null
        : validerCoutAnnuel(payload.coutAnnuel);
  }
  if (payload.dateAchat !== undefined && payload.dateAchat !== null) {
    const dateAchat = dateOptionnelle(payload.dateAchat, "dateAchat");
    if (dateAchat !== undefined) data.dateAchat = dateAchat;
  }
  if (payload.dateExp !== undefined) {
    // null autorisé : licence perpétuelle sans expiration
    data.dateExp = dateOptionnelle(payload.dateExp, "dateExp") ?? null;
  }

  // Ré-rattachement ou détachement (organisationId: null) d'organisation
  const organisation = await relationOrganisation(payload.organisationId);
  if (organisation !== undefined) data.organisation = organisation;

  const logiciel = await prisma.logiciel.update({
    where: { id },
    data,
    include: includeComplet,
  });
  return versDto(logiciel);
}

/** Supprime un logiciel (désinstalle ses installations, cascade). */
export async function supprimerLogiciel(id: number) {
  await verifierLogiciel(id);
  await prisma.logiciel.delete({ where: { id } });
}

// ---------------------------------------------------------------- Utilitaires

/** Valide le type de licence s'il est fourni (libellé → valeur d'enum). */
function typeOptionnel(valeur: unknown): TypeLicence | undefined {
  if (valeur === undefined || valeur === null) return undefined;
  const label = texteObligatoire(valeur, "typeLicence");
  const type = typeLicenceDepuisLibelle(label);
  if (type === undefined) {
    throw ApiError.badRequest(
      `Le champ « typeLicence » doit être l'une des valeurs : ${libellesTypeLicence().join(", ")}.`,
    );
  }
  return type;
}

/** Valide le coût annuel (nombre positif ou nul). */
function validerCoutAnnuel(valeur: unknown): number {
  const cout = nombreObligatoire(valeur, "coutAnnuel");
  if (cout < 0) {
    throw ApiError.badRequest("Le champ « coutAnnuel » doit être positif.");
  }
  return cout;
}

async function validerCreation(
  payload: LogicielPayload,
): Promise<Prisma.LogicielCreateInput> {
  const data: Prisma.LogicielCreateInput = {
    nom: texteObligatoire(payload.nom, "nom"),
    editeur: texteObligatoire(payload.editeur, "editeur"),
    cleLicence: texteObligatoire(payload.cleLicence, "cleLicence"),
  };

  const type = typeOptionnel(payload.typeLicence);
  if (type !== undefined) data.typeLicence = type;

  if (payload.siegesTotal !== undefined && payload.siegesTotal !== null) {
    data.siegesTotal = entierObligatoire(payload.siegesTotal, "siegesTotal");
  }
  if (payload.coutAnnuel !== undefined && payload.coutAnnuel !== null) {
    data.coutAnnuel = validerCoutAnnuel(payload.coutAnnuel);
  }

  const dateAchat = dateOptionnelle(payload.dateAchat, "dateAchat");
  if (dateAchat !== undefined) data.dateAchat = dateAchat;

  const dateExp = dateOptionnelle(payload.dateExp, "dateExp");
  if (dateExp !== undefined) data.dateExp = dateExp;

  // Rattachement optionnel à une organisation (404 si inconnue)
  const organisation = await relationOrganisationCreation(
    payload.organisationId,
  );
  if (organisation !== undefined) data.organisation = organisation;

  return data;
}

/**
 * DTO aligné sur le type `Licence` du frontend :
 * logiciel, editeur, cle, type, siegesUtilises, siegesTotal, dateExpiration, coutAnnuel.
 */
function versDto(logiciel: LogicielComplet) {
  return {
    id: logiciel.id,
    logiciel: logiciel.nom,
    editeur: logiciel.editeur,
    cle: logiciel.cleLicence,
    // Type stocké en enum (ex: Perpetuelle) — libellé français en sortie
    type: libelleDepuisTypeLicence(logiciel.typeLicence),
    siegesTotal: logiciel.siegesTotal,
    siegesUtilises: logiciel._count.affectations,
    dateAchat: logiciel.dateAchat,
    dateExpiration: logiciel.dateExp,
    coutAnnuel: logiciel.coutAnnuel,
  };
}