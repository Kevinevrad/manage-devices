import { Router } from "express";

import * as controller from "../controllers/equipement.controller";

const equipementRoutes = Router();

equipementRoutes.get("/", controller.lister);
equipementRoutes.post("/", controller.creer);
// L'export doit être déclaré avant la route /:id (qui capturerait "export")
equipementRoutes.get("/export", controller.exporter);
equipementRoutes.get("/:id", controller.obtenir);
equipementRoutes.put("/:id", controller.modifier);
equipementRoutes.delete("/:id", controller.supprimer);
equipementRoutes.get("/:id/logiciels", controller.listerLogiciels);
equipementRoutes.post("/:id/logiciels", controller.installerLogiciel);
equipementRoutes.delete("/:id/logiciels/:logicielId", controller.desinstallerLogiciel);

export { equipementRoutes };