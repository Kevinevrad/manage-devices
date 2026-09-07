import type { Request, Response } from "express";

import { authentifieRequis } from "../middlewares/auth.middleware";
import * as equipementService from "../services/equipement.service";
import { identifiantObligatoire } from "../utils/validation";

/** GET /api/equipements — liste filtrable (statut, categorie/type, q). */
export async function lister(req: Request, res: Response): Promise<void> {
  const equipements = await equipementService.listerEquipements(
    req.query,
    authentifieRequis(req),
  );
  res.json(equipements);
}

/** GET /api/equipements/:id */
export async function obtenir(req: Request, res: Response): Promise<void> {
  const equipement = await equipementService.obtenirEquipement(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.json(equipement);
}

/** POST /api/equipements */
export async function creer(req: Request, res: Response): Promise<void> {
  const equipement = await equipementService.creerEquipement(
    req.body,
    authentifieRequis(req),
  );
  res.status(201).json(equipement);
}

/** PUT /api/equipements/:id — mise à jour partielle acceptée. */
export async function modifier(req: Request, res: Response): Promise<void> {
  const equipement = await equipementService.modifierEquipement(
    identifiantObligatoire(req.params.id),
    req.body,
    authentifieRequis(req),
  );
  res.json(equipement);
}

/** DELETE /api/equipements/:id */
export async function supprimer(req: Request, res: Response): Promise<void> {
  await equipementService.supprimerEquipement(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.status(204).send();
}

/** GET /api/equipements/:id/logiciels — licences installées. */
export async function listerLogiciels(
  req: Request,
  res: Response,
): Promise<void> {
  const logiciels = await equipementService.listerLogicielsInstalles(
    identifiantObligatoire(req.params.id),
    authentifieRequis(req),
  );
  res.json(logiciels);
}

/** POST /api/equipements/:id/logiciels — installer une licence. */
export async function installerLogiciel(
  req: Request,
  res: Response,
): Promise<void> {
  const equipement = await equipementService.installerLogiciel(
    identifiantObligatoire(req.params.id),
    req.body,
    authentifieRequis(req),
  );
  res.status(201).json(equipement);
}

/** DELETE /api/equipements/:id/logiciels/:logicielId — désinstaller. */
export async function desinstallerLogiciel(
  req: Request,
  res: Response,
): Promise<void> {
  await equipementService.desinstallerLogiciel(
    identifiantObligatoire(req.params.id),
    identifiantObligatoire(req.params.logicielId),
    authentifieRequis(req),
  );
  res.status(204).send();
}