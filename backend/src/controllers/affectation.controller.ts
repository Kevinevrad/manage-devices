import type { Request, Response } from "express";

import { authentifieRequis } from "../middlewares/auth.middleware";
import * as affectationService from "../services/affectation.service";
import { identifiantObligatoire } from "../utils/validation";

/** GET /api/affectations — historique (filtres : equipementId, userId, ouvertes). */
export async function lister(req: Request, res: Response): Promise<void> {
  const affectations = await affectationService.listerAffectations(
    req.query,
    authentifieRequis(req),
  );
  res.json(affectations);
}

/** GET /api/affectations/:id */
export async function obtenir(req: Request, res: Response): Promise<void> {
  const affectation = await affectationService.obtenirAffectation(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.json(affectation);
}

/** POST /api/affectations — affecte un équipement à un utilisateur. */
export async function creer(req: Request, res: Response): Promise<void> {
  const affectation = await affectationService.creerAffectation(
    req.body,
    authentifieRequis(req),
  );
  res.status(201).json(affectation);
}

/** PATCH /api/affectations/:id/retour — clôture l'affectation (retour matériel). */
export async function retourner(req: Request, res: Response): Promise<void> {
  const affectation = await affectationService.cloturerAffectation(
    req.params.id,
    authentifieRequis(req),
  );
  res.json(affectation);
}