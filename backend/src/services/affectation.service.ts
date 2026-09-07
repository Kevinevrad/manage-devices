import { Prisma } from "../../prisma/generated/prisma/client";

import { StatutEquipement } from "../domain/statuts";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { BOM_UTF8, ligneCSV } from "../utils/csv";
import { entierOuIndefini, premierTexte } from "../utils/query";
import type { UtilisateurAuthentifie } from "../middlewares/auth.middleware";
import { contrainteOrganisation } from "./tenant";
import {
  dateOptionnelle,
  entierObligatoire,
  identifiantObligatoire,
  texteOptionnel,
} from "../utils/validation";
import { verifierEquipement } from "./equipement.service";
import { verifierUtilisateur } from "./user.service";

/** Include Prisma : équipement concerné + utilisateur (sans le hash du mot de passe). */
const includeComplet = {
  equipements: true,
  user: {
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      structure: true,
      service: true,
      role: true,
    },
  },
} satisfies Prisma.AffectationInclude;

interface AffectationPayload {
  equipementId?: unknown;
  userId?: unknown;
  commentaire?: unknown;
  dateDebut?: unknown;
}

/**
 * Liste les affectations (historique complet).
 * Filtres : ?equipementId=… &userId=… &ouvertes=true (affectations en cours)
 * &organisationId=… (héritée de l'équipement)
 */
export async function listerAffectations(
  query: Record<string, unknown>,
  utilisateur: UtilisateurAuthentifie,
) {
  const equipementId = entierOuIndefini(query.equipementId);
  const userId = entierOuIndefini(query.userId);
  const ouvertes = premierTexte(query.ouvertes) === "true";
  const organisationId = entierOuIndefini(query.organisationId);

  const where: Prisma.AffectationWhereInput = {};
  if (equipementId !== undefined) where.equipementId = equipementId;
  if (userId !== undefined) where.userId = userId;
  if (ouvertes) where.dateFin = null;
  if (organisationId !== undefined) {
    // L'affectation hérite de l'organisation de son équipement
    where.equipements = { organisationId };
  }
  // Isolation multi-tenant : prioritaire sur le filtre explicite
  const contrainte = contrainteOrganisation(utilisateur);
  if (contrainte !== undefined) {
    where.equipements = { organisationId: contrainte };
  }

  return prisma.affectation.findMany({
    where,
    include: includeComplet,
    orderBy: { dateDebut: "desc" },
  });
}

/** Récupère une affectation par son identifiant. */
export async function obtenirAffectation(
  id: number,
  utilisateur?: UtilisateurAuthentifie,
) {
  const affectation = await prisma.affectation.findUnique({
    where: { id },
    include: includeComplet,
  });
  if (affectation === null) {
    throw ApiError.notFound(`Affectation ${id} introuvable.`);
  }
  if (utilisateur !== undefined) {
    // L'affectation hérite de l'organisation de son équipement
    const contrainte = contrainteOrganisation(utilisateur);
    if (
      contrainte !== undefined &&
      affectation.equipements.organisationId !== contrainte
    ) {
      throw ApiError.notFound(`Affectation ${id} introuvable.`);
    }
  }
  return affectation;
}

/**
 * Affecte un équipement à un utilisateur :
 * clôture les affectations ouvertes de l'équipement, crée l'historique
 * et fait passer l'équipement « En service ».
 */
export async function creerAffectation(
  payload: AffectationPayload,
  utilisateur: UtilisateurAuthentifie,
) {
  const equipementId = entierObligatoire(payload.equipementId, "equipementId");
  const userId = entierObligatoire(payload.userId, "userId");
  await verifierEquipement(equipementId, utilisateur);
  const utilisateurCible = await verifierUtilisateur(userId);

  // Un utilisateur cloisonné ne peut affecter qu'au sein de son organisation
  const contrainte = contrainteOrganisation(utilisateur);
  if (contrainte !== undefined && utilisateurCible.organisationId !== contrainte) {
    throw ApiError.notFound(`Utilisateur ${userId} introuvable.`);
  }

  const dateDebut =
    dateOptionnelle(payload.dateDebut, "dateDebut") ?? new Date();

  const data: Prisma.AffectationCreateInput = {
    equipements: { connect: { id: equipementId } },
    user: { connect: { id: userId } },
    dateDebut,
  };
  const commentaire = texteOptionnel(payload.commentaire);
  if (commentaire !== undefined) data.commentaire = commentaire;

  // Clôture les affectations encore ouvertes sur cet équipement
  await prisma.affectation.updateMany({
    where: { equipementId, dateFin: null },
    data: { dateFin: new Date() },
  });

  const affectation = await prisma.affectation.create({
    data,
    include: includeComplet,
  });

  // L'équipement est rattaché à son nouvel utilisateur et passe « En service »
  await prisma.equipement.update({
    where: { id: equipementId },
    data: { userId, statut: StatutEquipement.EnService },
  });

  return affectation;
}

/**
 * Clôture une affectation (retour du matériel) :
 * dateFin renseignée, équipement détaché de l'utilisateur et repassé « En stock ».
 */
export async function cloturerAffectation(
  idParam: unknown,
  utilisateur: UtilisateurAuthentifie,
) {
  const id = identifiantObligatoire(idParam);
  const affectation = await obtenirAffectation(id, utilisateur);
  if (affectation.dateFin !== null) {
    throw ApiError.badRequest("Cette affectation est déjà clôturée.");
  }

  const maj = await prisma.affectation.update({
    where: { id },
    data: { dateFin: new Date() },
    include: includeComplet,
  });

  await prisma.equipement.update({
    where: { id: affectation.equipementId },
    data: { userId: null, statut: StatutEquipement.EnStock },
  });

  return maj;
}

/** Export CSV des affectations (scope tenant appliqué). */
export async function exporterAffectationsCSV(
  utilisateur: UtilisateurAuthentifie,
): Promise<string> {
  const affectations = await listerAffectations({}, utilisateur);
  const lignes = [
    ligneCSV([
      "Id",
      "Équipement",
      "Type",
      "Numéro de série",
      "Utilisateur",
      "Service",
      "Date de début",
      "Date de retour",
      "Commentaire",
    ]),
    ...affectations.map((affectation) =>
      ligneCSV([
        affectation.id,
        affectation.equipements.nom,
        affectation.equipements.type,
        affectation.equipements.numSerie,
        `${affectation.user.prenom} ${affectation.user.nom}`,
        affectation.user.service,
        affectation.dateDebut.toISOString().slice(0, 10),
        affectation.dateFin?.toISOString().slice(0, 10) ?? "",
        affectation.commentaire ?? "",
      ]),
    ),
  ];
  return `${BOM_UTF8}${lignes.join("\n")}`;
}