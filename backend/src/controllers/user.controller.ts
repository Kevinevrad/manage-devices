import type { Request, Response } from "express";

import { authentifieRequis } from "../middlewares/auth.middleware";
import * as userService from "../services/user.service";
import { identifiantObligatoire } from "../utils/validation";

/** GET /api/users */
export async function lister(req: Request, res: Response): Promise<void> {
  const users = await userService.listerUsers(
    req.query,
    authentifieRequis(req),
  );
  res.json(users);
}

/** GET /api/users/:id */
export async function obtenir(req: Request, res: Response): Promise<void> {
  const user = await userService.obtenirUser(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.json(user);
}

/** POST /api/users */
export async function creer(req: Request, res: Response): Promise<void> {
  const user = await userService.creerUser(
    req.body,
    authentifieRequis(req),
  );
  res.status(201).json(user);
}

/** PUT /api/users/:id — mise à jour partielle acceptée. */
export async function modifier(req: Request, res: Response): Promise<void> {
  const user = await userService.modifierUser(
    identifiantObligatoire(req.params.id),
    req.body,
    authentifieRequis(req),
  );
  res.json(user);
}

/** DELETE /api/users/:id */
export async function supprimer(req: Request, res: Response): Promise<void> {
  await userService.supprimerUser(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.status(204).send();
}