import type { UtilisateurApi } from "@/types/api";

export interface UsersTableProps {
  /** Liste des utilisateurs à afficher */
  data: UtilisateurApi[];
  /** Service actif du sous-menu (« tous » = aucune restriction) */
  service?: string;
}