import { Router } from "express";

import * as controller from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get("/", controller.lister);
userRoutes.post("/", controller.creer);
userRoutes.get("/:id", controller.obtenir);
userRoutes.put("/:id", controller.modifier);
userRoutes.delete("/:id", controller.supprimer);

export { userRoutes };