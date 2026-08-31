import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../prisma/generated/prisma/client";

import { ApiError } from "../utils/api-error";

/**
 * Middleware central de gestion des erreurs.
 * Express 5 transfère automatiquement ici les promesses rejetées
 * des handlers asynchrones — pas besoin de try/catch dans les controllers.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Erreurs métier (ApiError)
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  // Erreurs HTTP de parsing (ex: JSON malformé envoyé par le client)
  const type = (error as { type?: unknown }).type;
  const statutHttp = (error as { status?: unknown }).status;
  if (type === "entity.parse.failed" && typeof statutHttp === "number") {
    res.status(statutHttp).json({
      error: "Corps de requête invalide : JSON malformé.",
    });
    return;
  }

  // Erreurs connues de Prisma (unicité, clés étrangères, introuvables…)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const status =
      error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 400;
    res.status(status).json({
      error: traduireErreurPrisma(error),
      code: error.code,
    });
    return;
  }

  // Erreur inattendue : journalisée côté serveur, jamais exposée au client
  console.error("[API] Erreur inattendue :", error);
  res.status(500).json({ error: "Erreur interne du serveur" });
}

/** Traduit les codes d'erreur Prisma en messages compréhensibles. */
function traduireErreurPrisma(
  error: Prisma.PrismaClientKnownRequestError,
): string {
  switch (error.code) {
    case "P2002":
      return "Cette valeur existe déjà (contrainte d'unicité).";
    case "P2003":
      return "Cette action viole une contrainte de clé étrangère.";
    case "P2025":
      return "L'enregistrement demandé est introuvable.";
    default:
      return "Erreur de base de données.";
  }
}