import type { Equipement } from "@/data/equipements";

export interface EquipementsTableProps {
  /** Liste des équipements à afficher */
  data: Equipement[];
  /** Catégorie active du sous-menu (« tous » = aucune restriction) */
  categorie?: string;
}