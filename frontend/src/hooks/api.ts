/**
 * Hooks TanStack Query exposant les données de l'API aux composants.
 * Les mappers convertissent les DTO backend en modèles d'affichage.
 */

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AffectationFiltres,
  EquipementFiltres,
  LogicielFiltres,
} from "@/lib/api";
import { versAffectations, versEquipements, versLicences } from "@/lib/mappers";

/** Clés de cache centralisées (typées, pour l'invalidation future). */
export const clesRequetes = {
  equipements: (filtres?: EquipementFiltres) =>
    ["equipements", filtres ?? {}] as const,
  licences: (filtres?: LogicielFiltres) => ["licences", filtres ?? {}] as const,
  utilisateurs: () => ["utilisateurs"] as const,
  affectations: (filtres?: AffectationFiltres) =>
    ["affectations", filtres ?? {}] as const,
};

/** Liste des équipements (modèles d'affichage). */
export function useEquipements(filtres?: EquipementFiltres) {
  return useQuery({
    queryKey: clesRequetes.equipements(filtres),
    queryFn: async () => versEquipements(await api.equipements.lister(filtres)),
  });
}

/** Liste des licences (modèles d'affichage). */
export function useLicences(filtres?: LogicielFiltres) {
  return useQuery({
    queryKey: clesRequetes.licences(filtres),
    queryFn: async () => versLicences(await api.logiciels.lister(filtres)),
  });
}

/** Liste des utilisateurs (DTO brut, enrichi de nomComplet). */
export function useUtilisateurs() {
  return useQuery({
    queryKey: clesRequetes.utilisateurs(),
    queryFn: () => api.utilisateurs.lister(),
  });
}

/** Historique des affectations (modèles d'affichage). */
export function useAffectations(filtres?: AffectationFiltres) {
  return useQuery({
    queryKey: clesRequetes.affectations(filtres),
    queryFn: async () =>
      versAffectations(await api.affectations.lister(filtres)),
  });
}