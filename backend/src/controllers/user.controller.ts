import type { Request, Response } from "express";

import * as userService from "../services/user.service";
import { identifiantObligatoire } from "../utils/validation";

/** GET /api/users */
export async function lister(req: Request, res: Response): Promise<void> {
  const users = await userService.listerUsers(req.query);
  res.json(users);
}

/** GET /api/users/:id */
export async function obtenir(req: Request, res: Response): Promise<void> {
  const user = await userService.obtenirUser(
    identifiantObligatoire(req.params.id),
  );
  res.json(user);
}

/** POST /api/users */
export async function creer(req: Request, res: Response): Promise<void> {
  const user = await userService.creerUser(req.body);
  res.status(201).json(user);
}

/** PUT /api/users/:id — mise à jour partielle acceptée. */
export async function modifier(req: Request, res: Response): Promise<void> {
  const user = await userService.modifierUser(
    identifiantObligatoire(req.params.id),
    req.body,
  );
  res.json(user);
}

/** DELETE /api/users/:id */
export async function supprimer(req: Request, res: Response): Promise<void> {
  await userService.supprimerUser(identifiantObligatoire(req.params.id));
  res.status(204).send();
}