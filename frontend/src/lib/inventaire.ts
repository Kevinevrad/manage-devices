/**
 * Statistiques d'inventaire (page Rapports → Inventaire) : synthèse
 * du parc et de la couverture logicielle à partir des données réelles.
 */

import type { Equipement } from "@/data/equipements";
import type { Licence } from "@/data/licences";
import { getLicenceStatut } from "@/data/licences";

export interface SyntheseInventaire {
  totalEquipements: number;
  enService: number;
  enStock: number;
  enPanne: number;
  rebut: number;
  totalLicences: number;
  licencesActives: number;
  licencesExpirentBientot: number;
  licencesExpirees: number;
  coutAnnuelTotal: number;
  valeurParc: number;
}

/** Calcule la synthèse à partir des équipements et licences réels. */
export function calculerSyntheseInventaire(
  equipements: Equipement[],
  licences: Licence[],
): SyntheseInventaire {
  const parStatut = (statut: string) =>
    equipements.filter((e) => e.statut === statut).length;

  const licencesExpirentBientot = licences.filter(
    (l) => getLicenceStatut(l) === "Expire bientôt",
  ).length;
  const licencesExpirees = licences.filter(
    (l) => getLicenceStatut(l) === "Expirée",
  ).length;

  return {
    totalEquipements: equipements.length,
    enService: parStatut("En service"),
    enStock: parStatut("En stock"),
    enPanne: parStatut("En panne"),
    rebut: parStatut("Rebut"),
    totalLicences: licences.length,
    licencesActives: licences.length - licencesExpirentBientot - licencesExpirees,
    licencesExpirentBientot,
    licencesExpirees,
    coutAnnuelTotal: licences.reduce((total, l) => total + (l.coutAnnuel ?? 0), 0),
    valeurParc: equipements.reduce((total, e) => total + e.prix, 0),
  };
}