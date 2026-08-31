import type { Request, Response } from "express";

import * as logicielService from "../services/logiciel.service";
import { identifiantObligatoire } from "../utils/validation";

/** GET /api/logiciels — liste filtrable (type, q, expireSous). */
export async function lister(req: Request, res: Response): Promise<void> {
  const logiciels = await logicielService.listerLogiciels(req.query);
  res.json(logiciels);
}

/** GET /api/logiciels/:id — avec la liste des installations. */
export async function obtenir(req: Request, res: Response): Promise<void> {
  const logiciel = await logicielService.obtenirLogiciel(
    identifiantObligatoire(req.params.id),
  );
  res.json(logiciel);
}

/** POST /api/logiciels */
export async function creer(req: Request, res: Response): Promise<void> {
  const logiciel = await logicielService.creerLogiciel(req.body);
  res.status(201).json(logiciel);
}

/** PUT /api/logiciels/:id — mise à jour partielle acceptée. */
export async function modifier(req: Request, res: Response): Promise<void> {
  const logiciel = await logicielService.modifierLogiciel(
    identifiantObligatoire(req.params.id),
    req.body,
  );
  res.json(logiciel);
}

/** DELETE /api/logiciels/:id */
export async function supprimer(req: Request, res: Response): Promise<void> {
  await logicielService.supprimerLogiciel(
    identifiantObligatoire(req.params.id),
  );
  res.status(204).send();
}