/**
 * Erreur applicative transportant un code de statut HTTP.
 * Lancée par les services, interceptée par le middleware d'erreurs.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** 400 — requête invalide (champ manquant, format incorrect…). */
  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  /** 404 — ressource introuvable. */
  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  /** 409 — conflit (unicité, sièges de licence épuisés…). */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
}