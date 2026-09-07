import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import {
  StatutEquipement,
  libelleDepuisStatutEquipement,
  libellesStatutEquipement,
  statutEquipementDepuisLibelle,
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
import type { UtilisateurAuthentifie } from "../middlewares/auth.middleware";
import {
  contrainteOrganisation,
  verifierVisibilite,
} from "./tenant";
import { verifierUtilisateur } from "./user.service";

/** Include Prisma : utilisateur courant + licences installées. */
const includeComplet = {
  organisation: { select: { id: true, nom: true } },
  utilisateur: { select: { id: true, nom: true, prenom: true } },
  logiciels: { include: { logiciel: true } },
} satisfies Prisma.EquipementInclude;

type EquipementComplet = Prisma.EquipementGetPayload<{
  include: typeof includeComplet;
}>;

interface EquipementPayload {
  nom?: unknown;
  type?: unknown;
  marque?: unknown;
  prix?: unknown;
  numSerie?: unknown;
  statut?: unknown;
  dateAchat?: unknown;
  userId?: unknown;
  organisationId?: unknown;
}

/** Vérifie qu'un équipement existe et est visible (404 sinon). */
export async function verifierEquipement(
  id: number,
  utilisateur?: UtilisateurAuthentifie,
) {
  const equipement = await prisma.equipement.findUnique({ where: { id } });
  if (equipement === null) {
    throw ApiError.notFound(`Équipement ${id} introuvable.`);
  }
  if (utilisateur !== undefined) verifierVisibilite(equipement, utilisateur);
  return equipement;
}

/**
 * Liste les équipements.
 * Filtres : ?statut=… &categorie=… (ou &type=…) &q=… (nom, marque, n° de série)
 * &organisationId=…
 */
export async function listerEquipements(
  query: Record<string, unknown>,
  utilisateur: UtilisateurAuthentifie,
) {
  const statutLabel = premierTexte(query.statut);
  const statutFiltre =
    statutLabel === undefined
      ? undefined
      : statutEquipementDepuisLibelle(statutLabel);
  if (statutLabel !== undefined && statutFiltre === undefined) {
    throw ApiError.badRequest(
      `Le filtre « statut » doit être l'une des valeurs : ${libellesStatutEquipement().join(", ")}.`,
    );
  }
  const categorie = premierTexte(query.categorie) ?? premierTexte(query.type);
  const recherche = premierTexte(query.q);
  const organisationId = entierOuIndefini(query.organisationId);

  const where: Prisma.EquipementWhereInput = {};
  if (statutFiltre !== undefined) where.statut = statutFiltre;
  if (categorie !== undefined) where.type = categorie;
  if (organisationId !== undefined) where.organisationId = organisationId;
  // Isolation multi-tenant : prioritaire sur le filtre explicite
  const contrainte = contrainteOrganisation(utilisateur);
  if (contrainte !== undefined) where.organisationId = contrainte;
  if (recherche !== undefined) {
    where.OR = [
      { nom: { contains: recherche } },
      { marque: { contains: recherche } },
      { numSerie: { contains: recherche } },
    ];
  }

  const equipements = await prisma.equipement.findMany({
    where,
    include: includeComplet,
    orderBy: { id: "asc" },
  });
  return equipements.map(versDto);
}

/** Récupère un équipement par son identifiant (404 sinon, 404 hors tenant). */
export async function obtenirEquipement(
  id: number,
  utilisateur: UtilisateurAuthentifie,
) {
  const equipement = await prisma.equipement.findUnique({
    where: { id },
    include: includeComplet,
  });
  if (equipement === null) {
    throw ApiError.notFound(`Équipement ${id} introuvable.`);
  }
  verifierVisibilite(equipement, utilisateur);
  return versDto(equipement);
}

/** Crée un équipement (le n° de série doit être unique — 409 sinon). */
export async function creerEquipement(
  payload: EquipementPayload,
  utilisateur: UtilisateurAuthentifie,
) {
  const data: Prisma.EquipementCreateInput = {
    nom: texteObligatoire(payload.nom, "nom"),
    type: texteObligatoire(payload.type, "type"),
    marque: texteObligatoire(payload.marque, "marque"),
    prix: nombreObligatoire(payload.prix, "prix"),
    numSerie: texteObligatoire(payload.numSerie, "numSerie"),
  };

  const statut = statutOptionnel(payload.statut);
  if (statut !== undefined) data.statut = statut;

  const dateAchat = dateOptionnelle(payload.dateAchat, "dateAchat");
  if (dateAchat !== undefined) data.dateAchat = dateAchat;

  // Un équipement créé directement affecté passe « En service »
  if (payload.userId !== undefined && payload.userId !== null) {
    const userId = entierObligatoire(payload.userId, "userId");
    await verifierUtilisateur(userId);
    data.utilisateur = { connect: { id: userId } };
    if (statut === undefined) data.statut = StatutEquipement.EnService;
  }

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

  const equipement = await prisma.equipement.create({
    data,
    include: includeComplet,
  });
  return versDto(equipement);
}

/** Met à jour partiellement un équipement. */
export async function modifierEquipement(
  id: number,
  payload: EquipementPayload,
  utilisateur: UtilisateurAuthentifie,
) {
  await verifierEquipement(id, utilisateur);
  const data = await validerMiseAJour(payload);

  const equipement = await prisma.equipement.update({
    where: { id },
    data,
    include: includeComplet,
  });
  return versDto(equipement);
}

/**
 * Supprime un équipement.
 * Les affectations et installations de licences liées sont supprimées (cascade).
 */
export async function supprimerEquipement(
  id: number,
  utilisateur: UtilisateurAuthentifie,
) {
  await verifierEquipement(id, utilisateur);
  await prisma.equipement.delete({ where: { id } });
}

/** Liste les logiciels installés sur un équipement. */
export async function listerLogicielsInstalles(
  id: number,
  utilisateur: UtilisateurAuthentifie,
) {
  const equipement = await prisma.equipement.findUnique({
    where: { id },
    include: { logiciels: { include: { logiciel: true } } },
  });
  if (equipement === null) {
    throw ApiError.notFound(`Équipement ${id} introuvable.`);
  }
  verifierVisibilite(equipement, utilisateur);
  return equipement.logiciels.map((installation) => installation.logiciel);
}

/** Installe une licence sur un équipement (POST /equipements/:id/logiciels). */
export async function installerLogiciel(
  id: number,
  payload: { logicielId?: unknown },
  utilisateur: UtilisateurAuthentifie,
) {
  const logicielId = entierObligatoire(payload.logicielId, "logicielId");
  await verifierEquipement(id, utilisateur);

  const logiciel = await prisma.logiciel.findUnique({
    where: { id: logicielId },
    select: {
      nom: true,
      siegesTotal: true,
      _count: { select: { affectations: true } },
    },
  });
  if (logiciel === null) {
    throw ApiError.badRequest(`Logiciel ${logicielId} introuvable.`);
  }
  // Respect du nombre de sièges de la licence
  if (
    logiciel.siegesTotal !== null &&
    logiciel._count.affectations >= logiciel.siegesTotal
  ) {
    throw ApiError.conflict(
      `Tous les sièges de la licence « ${logiciel.nom} » sont déjà utilisés.`,
    );
  }

  await prisma.licencesSurEquipement.create({
    data: { equipementId: id, logicielId },
  });
  return obtenirEquipement(id, utilisateur);
}

/** Désinstalle une licence d'un équipement. */
export async function desinstallerLogiciel(
  id: number,
  logicielId: number,
  utilisateur: UtilisateurAuthentifie,
) {
  await verifierEquipement(id, utilisateur);
  const installation = await prisma.licencesSurEquipement.findUnique({
    where: { equipementId_logicielId: { equipementId: id, logicielId } },
  });
  if (installation === null) {
    throw ApiError.notFound(
      `La licence ${logicielId} n'est pas installée sur l'équipement ${id}.`,
    );
  }
  await prisma.licencesSurEquipement.delete({
    where: { equipementId_logicielId: { equipementId: id, logicielId } },
  });
}

// ---------------------------------------------------------------- Utilitaires

/** Valide le statut s'il est fourni (libellé français → valeur d'enum). */
function statutOptionnel(valeur: unknown): StatutEquipement | undefined {
  if (valeur === undefined || valeur === null) return undefined;
  const label = texteObligatoire(valeur, "statut");
  const statut = statutEquipementDepuisLibelle(label);
  if (statut === undefined) {
    throw ApiError.badRequest(
      `Le champ « statut » doit être l'une des valeurs : ${libellesStatutEquipement().join(", ")}.`,
    );
  }
  return statut;
}

/** Construit les données de mise à jour (uniquement les champs fournis). */
async function validerMiseAJour(
  payload: EquipementPayload,
): Promise<Prisma.EquipementUpdateInput> {
  const data: Prisma.EquipementUpdateInput = {};

  if (payload.nom !== undefined) data.nom = texteObligatoire(payload.nom, "nom");
  if (payload.type !== undefined) {
    data.type = texteObligatoire(payload.type, "type");
  }
  if (payload.marque !== undefined) {
    data.marque = texteObligatoire(payload.marque, "marque");
  }
  if (payload.numSerie !== undefined) {
    data.numSerie = texteObligatoire(payload.numSerie, "numSerie");
  }
  if (payload.prix !== undefined) {
    data.prix = nombreObligatoire(payload.prix, "prix");
  }
  const statut = statutOptionnel(payload.statut);
  if (statut !== undefined) data.statut = statut;
  if (payload.dateAchat !== undefined && payload.dateAchat !== null) {
    const dateAchat = dateOptionnelle(payload.dateAchat, "dateAchat");
    if (dateAchat !== undefined) data.dateAchat = dateAchat;
  }

  // Ré-affectation / désaffectation de l'utilisateur courant
  if (payload.userId !== undefined) {
    if (payload.userId === null) {
      data.utilisateur = { disconnect: true };
      // Un équipement désaffecté repasse « En stock » (sauf statut explicite)
      if (payload.statut === undefined) data.statut = StatutEquipement.EnStock;
    } else {
      const userId = entierObligatoire(payload.userId, "userId");
      await verifierUtilisateur(userId);
      data.utilisateur = { connect: { id: userId } };
      if (payload.statut === undefined) data.statut = StatutEquipement.EnService;
    }
  }

  // Ré-rattachement ou détachement (organisationId: null) d'organisation
  const organisation = await relationOrganisation(payload.organisationId);
  if (organisation !== undefined) data.organisation = organisation;

  return data;
}

/** Enrichit l'équipement avec « affecteA » (nom complet de l'utilisateur). */
function versDto(equipement: EquipementComplet) {
  return {
    ...equipement,
    // Statut stocké en enum (ex: En_service) — libellé français en sortie
    statut: libelleDepuisStatutEquipement(equipement.statut),
    affecteA: equipement.utilisateur
      ? `${equipement.utilisateur.prenom} ${equipement.utilisateur.nom}`
      : null,
  };
}