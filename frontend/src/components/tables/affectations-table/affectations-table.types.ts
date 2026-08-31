import type { Affectation } from "@/data/affectations";

export interface AffectationsTableProps {
  /** Liste des affectations à afficher */
  data: Affectation[];
  /** Service actif du sous-menu (« tous » = aucune restriction) */
  service?: string;
}
