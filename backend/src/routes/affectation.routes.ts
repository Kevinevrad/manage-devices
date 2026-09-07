import { Router } from "express";

import * as controller from "../controllers/affectation.controller";

const affectationRoutes = Router();

affectationRoutes.get("/", controller.lister);
affectationRoutes.post("/", controller.creer);
// L'export doit être déclaré avant la route /:id (qui capturerait "export")
affectationRoutes.get("/export", controller.exporter);
affectationRoutes.get("/:id", controller.obtenir);
affectationRoutes.patch("/:id/retour", controller.retourner);

export { affectationRoutes };