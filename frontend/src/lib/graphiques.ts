/**
 * Construction des données des graphiques du dashboard à partir des
 * données réelles de l'API (remplace les tableaux figés de src/data/charts.ts
 * — ce fichier conserve uniquement les configurations recharts).
 */

import type { Affectation } from "@/data/affectations";
import type { Equipement } from "@/data/equipements";

/** Ordre d'affichage des statuts du parc + couleurs recharts associées. */
const STATUTS_GRAPHIQUE = [
  { statut: "En service", fill: "var(--chart-1)" },
  { statut: "En stock", fill: "var(--chart-2)" },
  { statut: "En panne", fill: "var(--chart-4)" },
  { statut: "Rebut", fill: "var(--chart-5)" },
] as const;

export interface DonneeStatut {
  statut: string;
  total: number;
  fill: string;
}

/** Répartition du parc par statut (ordre et couleurs fixes). */
export function construireEquipementsParStatut(
  equipements: Equipement[],
): DonneeStatut[] {
  return STATUTS_GRAPHIQUE.map(({ statut, fill }) => ({
    statut,
    fill,
    total: equipements.filter((equipement) => equipement.statut === statut)
      .length,
  }));
}

export interface DonneeMois {
  mois: string;
  affectations: number;
}

const FORMAT_MOIS = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/** Tendance des affectations par mois de début, sur les 6 derniers mois. */
export function construireTendanceAffectations(
  affectations: Affectation[],
): DonneeMois[] {
  const aujourdhui = new Date();
  const serie: DonneeMois[] = [];

  for (let decalage = 5; decalage >= 0; decalage -= 1) {
    const annee = aujourdhui.getFullYear();
    const mois = aujourdhui.getMonth() - decalage;
    const debutMois = new Date(annee, mois, 1);
    // Comparaison AAAA-MM : indépendante du fuseau horaire
    const cle = `${debutMois.getFullYear()}-${String(debutMois.getMonth() + 1).padStart(2, "0")}`;
    const total = affectations.filter(
      (affectation) => affectation.dateAffectation.slice(0, 7) === cle,
    ).length;

    serie.push({ mois: FORMAT_MOIS.format(debutMois), affectations: total });
  }

  return serie;
}