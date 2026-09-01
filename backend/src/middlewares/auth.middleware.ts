import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { verifierJetton } from "../utils/auth";

/** Informations de l'utilisateur authentifié, attachées à la requête. */
export interface UtilisateurAuthentifie {
  id: number;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    utilisateur?: UtilisateurAuthentifie;
  }
}

/** Exige un JWT « Bearer » valide et l'attache à req.utilisateur. */
export function exigerAuthentification(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const entete = req.headers.authorization;
  if (!entete?.startsWith("Bearer ")) {
    throw ApiError.unauthorized(
      "Authentification requise : jeton Bearer manquant.",
    );
  }
  const charge = verifierJetton(entete.slice("Bearer ".length).trim());
  req.utilisateur = charge;
  next();
}

/** Restreint une route à certains rôles (après exigerAuthentification). */
export function exigerRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.utilisateur === undefined) {
      throw ApiError.unauthorized("Authentification requise.");
    }
    if (!roles.includes(req.utilisateur.role)) {
      throw ApiError.forbidden(
        "Vous n'avez pas les droits nécessaires pour cette action.",
      );
    }
    next();
  };
}