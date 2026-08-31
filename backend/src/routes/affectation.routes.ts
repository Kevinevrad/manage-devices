import { Router } from "express";

import * as controller from "../controllers/affectation.controller";

const affectationRoutes = Router();

affectationRoutes.get("/", controller.lister);
affectationRoutes.post("/", controller.creer);
affectationRoutes.get("/:id", controller.obtenir);
affectationRoutes.patch("/:id/retour", controller.retourner);

export { affectationRoutes };