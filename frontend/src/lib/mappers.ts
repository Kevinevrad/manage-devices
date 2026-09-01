/**
 * Transformations DTO API → modèles d'affichage du frontend
 * (types consommés par les tables, colonnes et cartes de métriques).
 * Les dates ISO complètes sont réduites à AAAA-MM-JJ.
 */

import type { Affectation } from "@/data/affectations";
import type { Equipement } from "@/data/equipements";
import type { Licence } from "@/data/licences";
import type { AffectationApi, EquipementApi, LicenceApi } from "@/types/api";

/** Extrait la partie date d'une valeur ISO (AAAA-MM-JJ). */
const jourIso = (valeur: string): string => valeur.slice(0, 10);

export function versEquipement(raw: EquipementApi): Equipement {
  return {
    id: raw.id,
    nom: raw.nom,
    type: raw.type,
    marque: raw.marque,
    numSerie: raw.numSerie,
    statut: raw.statut as Equipement["statut"],
    dateAchat: jourIso(raw.dateAchat),
    affecteA: raw.affecteA,
    prix: raw.prix,
  };
}

export function versEquipements(raws: EquipementApi[]): Equipement[] {
  return raws.map(versEquipement);
}

export function versLicence(raw: LicenceApi): Licence {
  return {
    id: raw.id,
    logiciel: raw.logiciel,
    editeur: raw.editeur,
    cle: raw.cle,
    type: raw.type as Licence["type"],
    siegesUtilises: raw.siegesUtilises,
    // Licence sans plafond (siegesTotal null) : affichée à hauteur de son usage
    siegesTotal: raw.siegesTotal ?? raw.siegesUtilises,
    dateExpiration: raw.dateExpiration ? jourIso(raw.dateExpiration) : null,
    coutAnnuel: raw.coutAnnuel,
  };
}

export function versLicences(raws: LicenceApi[]): Licence[] {
  return raws.map(versLicence);
}

export function versAffectation(raw: AffectationApi): Affectation {
  return {
    id: raw.id,
    equipement: raw.equipements.nom,
    typeEquipement: raw.equipements.type,
    numSerie: raw.equipements.numSerie,
    utilisateur: `${raw.user.prenom} ${raw.user.nom}`,
    service: raw.user.service,
    dateAffectation: jourIso(raw.dateDebut),
    dateRetour: raw.dateFin ? jourIso(raw.dateFin) : null,
  };
}

export function versAffectations(raws: AffectationApi[]): Affectation[] {
  return raws.map(versAffectation);
}