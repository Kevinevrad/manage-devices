import type { DonneeMois, DonneeStatut } from "@/lib/graphiques";

export interface ChartsSectionProps {
  className?: string;
  /** Répartition du parc par statut (données réelles). */
  equipementsParStatut: DonneeStatut[];
  /** Affectations des 6 derniers mois (données réelles). */
  tendanceAffectations: DonneeMois[];
}