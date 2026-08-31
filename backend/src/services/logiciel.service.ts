import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { premierTexte } from "../utils/query";
import {
  dateOptionnelle,
  entierObligatoire,
  nombreObligatoire,
  texteObligatoire,
} from "../utils/validation";

/** Types de licence autorisés (alignés sur le frontend). */
const TYPES_LICENCE = ["Abonnement", "Perpétuelle"] as const;

/** Include Prisma : nombre d'installations (= sièges utilisés). */
const includeComplet = {
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
 */
export async function listerLogiciels(query: Record<string, unknown>) {
  const type = premierTexte(query.type);
  const recherche = premierTexte(query.q);
  const expireSous = premierTexte(query.expireSous);

  const where: Prisma.LogicielWhereInput = {};
  if (type !== undefined) where.typeLicence = type;
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
  const data = validerCreation(payload);
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

/** Valide le type de licence s'il est fourni. */
function typeOptionnel(valeur: unknown): string | undefined {
  if (valeur === undefined || valeur === null) return undefined;
  const type = texteObligatoire(valeur, "typeLicence");
  if (!(TYPES_LICENCE as readonly string[]).includes(type)) {
    throw ApiError.badRequest(
      `Le champ « typeLicence » doit être l'une des valeurs : ${TYPES_LICENCE.join(", ")}.`,
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

function validerCreation(payload: LogicielPayload): Prisma.LogicielCreateInput {
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
    type: logiciel.typeLicence,
    siegesTotal: logiciel.siegesTotal,
    siegesUtilises: logiciel._count.affectations,
    dateAchat: logiciel.dateAchat,
    dateExpiration: logiciel.dateExp,
    coutAnnuel: logiciel.coutAnnuel,
  };
}