import type { Request, Response } from "express";

import { authentifieRequis } from "../middlewares/auth.middleware";
import * as organisationService from "../services/organisation.service";
import { identifiantObligatoire } from "../utils/validation";

/** GET /api/organisations */
export async function lister(
  req: Request,
  res: Response,
): Promise<void> {
  const organisations = await organisationService.listerOrganisations(
    authentifieRequis(req),
  );
  res.json(organisations);
}

/** GET /api/organisations/:id */
export async function obtenir(req: Request, res: Response): Promise<void> {
  const organisation = await organisationService.obtenirOrganisation(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.json(organisation);
}

/** POST /api/organisations */
export async function creer(req: Request, res: Response): Promise<void> {
  const organisation = await organisationService.creerOrganisation(req.body);
  res.status(201).json(organisation);
}

/** PUT /api/organisations/:id — mise à jour partielle acceptée. */
export async function modifier(req: Request, res: Response): Promise<void> {
  const organisation = await organisationService.modifierOrganisation(
    identifiantObligatoire(req.params.id),
    req.body,
  );
  res.json(organisation);
}

/** DELETE /api/organisations/:id */
export async function supprimer(req: Request, res: Response): Promise<void> {
  await organisationService.supprimerOrganisation(
    identifiantObligatoire(req.params.id),
  );
  res.status(204).send();
}