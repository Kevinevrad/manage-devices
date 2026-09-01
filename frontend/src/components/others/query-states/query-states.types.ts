export interface ErreurDonneesProps {
  /** Message d'erreur à afficher (ex: error.message de la requête). */
  message?: string;
  /** Relance la requête échouée (refetch TanStack Query). */
  onReessayer?: () => void;
}