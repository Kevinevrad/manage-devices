import { Router } from "express";

import * as controller from "../controllers/user.controller";
import { exigerRole } from "../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.get("/", controller.lister);
userRoutes.post("/", controller.creer);
userRoutes.get("/:id", controller.obtenir);
userRoutes.put("/:id", controller.modifier);
// La suppression d'utilisateurs est réservée aux administrateurs
userRoutes.delete("/:id", exigerRole("admin"), controller.supprimer);

export { userRoutes };