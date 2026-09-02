import { Prisma } from "../../prisma/generated/prisma/client";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { entierOuIndefini, premierTexte } from "../utils/query";
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
 */
export async function listerAffectations(query: Record<string, unknown>) {
  const equipementId = entierOuIndefini(query.equipementId);
  const userId = entierOuIndefini(query.userId);
  const ouvertes = premierTexte(query.ouvertes) === "true";

  const where: Prisma.AffectationWhereInput = {};
  if (equipementId !== undefined) where.equipementId = equipementId;
  if (userId !== undefined) where.userId = userId;
  if (ouvertes) where.dateFin = null;

  return prisma.affectation.findMany({
    where,
    include: includeComplet,
    orderBy: { dateDebut: "desc" },
  });
}

/** Récupère une affectation par son identifiant. */
export async function obtenirAffectation(id: number) {
  const affectation = await prisma.affectation.findUnique({
    where: { id },
    include: includeComplet,
  });
  if (affectation === null) {
    throw ApiError.notFound(`Affectation ${id} introuvable.`);
  }
  return affectation;
}

/**
 * Affecte un équipement à un utilisateur :
 * clôture les affectations ouvertes de l'équipement, crée l'historique
 * et fait passer l'équipement « En service ».
 */
export async function creerAffectation(payload: AffectationPayload) {
  const equipementId = entierObligatoire(payload.equipementId, "equipementId");
  const userId = entierObligatoire(payload.userId, "userId");
  await verifierEquipement(equipementId);
  await verifierUtilisateur(userId);

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
    data: { userId, statut: "En service" },
  });

  return affectation;
}

/**
 * Clôture une affectation (retour du matériel) :
 * dateFin renseignée, équipement détaché de l'utilisateur et repassé « En stock ».
 */
export async function cloturerAffectation(idParam: unknown) {
  const id = identifiantObligatoire(idParam);
  const affectation = await obtenirAffectation(id);
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
    data: { userId: null, statut: "En stock" },
  });

  return maj;
}