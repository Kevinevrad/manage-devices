import { ApiError } from "../utils/api-error";
import type { UtilisateurAuthentifie } from "../middlewares/auth.middleware";

/**
 * Isolation multi-tenant (mono-schéma) :
 * - `admin` → accès global (aucune contrainte, support plateforme) ;
 * - autre rôle avec organisation → cloisonné à son organisation ;
 * - autre rôle sans organisation → accès global (mode plateforme/démo).
 *
 * `contrainteOrganisation` renvoie l'identifiant d'organisation à appliquer
 * comme filtre, ou `undefined` si aucune contrainte ne s'applique.
 */
export function contrainteOrganisation(
  utilisateur: UtilisateurAuthentifie,
): number | undefined {
  if (utilisateur.role === "admin") return undefined;
  return utilisateur.organisationId ?? undefined;
}

/**
 * Vérifie la visibilité multi-tenant d'une entité (anti-IDOR) :
 * un utilisateur cloisonné qui accède à une entité d'un autre tenant
 * reçoit un 404 (la ressource « n'existe pas » pour lui).
 */
export function verifierVisibilite<
  T extends { organisationId: number | null },
>(entite: T, utilisateur: UtilisateurAuthentifie): T {
  const contrainte = contrainteOrganisation(utilisateur);
  if (contrainte !== undefined && entite.organisationId !== contrainte) {
    throw ApiError.notFound("Ressource introuvable.");
  }
  return entite;
}