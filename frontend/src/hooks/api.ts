/**
 * Hooks TanStack Query exposant les données de l'API aux composants.
 * Les mappers convertissent les DTO backend en modèles d'affichage.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type {
  AffectationFiltres,
  EquipementFiltres,
  LogicielFiltres,
} from "@/lib/api";
import type {
  DonneesAffectation,
  DonneesEquipement,
  DonneesLicence,
} from "@/types/api";
import { versAffectations, versEquipements, versLicences } from "@/lib/mappers";

/** Invalide toutes les clés d'une ressource (préfixe de clé de cache). */
function invalider(
  queryClient: ReturnType<typeof useQueryClient>,
  ressource: string,
): void {
  void queryClient.invalidateQueries({ queryKey: [ressource] });
}

/** Message lisible depuis une erreur API ou réseau. */
function messageErreur(error: unknown, defaut: string): string {
  return error instanceof Error ? error.message : defaut;
}

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

// ------------------------------------------------------------------ Mutations

/** Crée un équipement puis invalide les listes du parc. */
export function useCreerEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (donnees: DonneesEquipement) =>
      api.equipements.creer(donnees),
    onSuccess: (equipement) => {
      invalider(queryClient, "equipements");
      invalider(queryClient, "affectations");
      toast.success(`Équipement « ${equipement.nom} » créé.`);
    },
    onError: (error: unknown) =>
      toast.error(messageErreur(error, "Création de l'équipement impossible.")),
  });
}

/** Supprime un équipement puis invalide les listes du parc. */
export function useSupprimerEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.equipements.supprimer(id),
    onSuccess: () => {
      invalider(queryClient, "equipements");
      invalider(queryClient, "affectations");
      toast.success("Équipement supprimé.");
    },
    onError: (error: unknown) =>
      toast.error(messageErreur(error, "Suppression impossible.")),
  });
}

/** Crée une affectation puis invalide affectations + équipements. */
export function useCreerAffectation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (donnees: DonneesAffectation) =>
      api.affectations.creer(donnees),
    onSuccess: (affectation) => {
      invalider(queryClient, "affectations");
      invalider(queryClient, "equipements");
      toast.success(
        `« ${affectation.equipements.nom} » affecté à ${affectation.user.prenom} ${affectation.user.nom}.`,
      );
    },
    onError: (error: unknown) =>
      toast.error(messageErreur(error, "Création de l'affectation impossible.")),
  });
}

/** Clôture une affectation (retour du matériel) puis invalide les listes. */
export function useCloturerAffectation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.affectations.cloturer(id),
    onSuccess: (affectation) => {
      invalider(queryClient, "affectations");
      invalider(queryClient, "equipements");
      toast.success(`« ${affectation.equipements.nom} » restitué.`);
    },
    onError: (error: unknown) =>
      toast.error(messageErreur(error, "Clôture impossible.")),
  });
}

/** Crée une licence puis invalide la liste des licences. */
export function useCreerLicence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (donnees: DonneesLicence) => api.logiciels.creer(donnees),
    onSuccess: (licence) => {
      invalider(queryClient, "licences");
      toast.success(`Licence « ${licence.logiciel} » créée.`);
    },
    onError: (error: unknown) =>
      toast.error(messageErreur(error, "Création de la licence impossible.")),
  });
}