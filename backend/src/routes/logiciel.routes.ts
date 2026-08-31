import { Router } from "express";

import * as controller from "../controllers/logiciel.controller";

const logicielRoutes = Router();

logicielRoutes.get("/", controller.lister);
logicielRoutes.post("/", controller.creer);
logicielRoutes.get("/:id", controller.obtenir);
logicielRoutes.put("/:id", controller.modifier);
logicielRoutes.delete("/:id", controller.supprimer);

export { logicielRoutes };