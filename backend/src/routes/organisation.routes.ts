import { Router } from "express";

import * as controller from "../controllers/organisation.controller";
import { exigerRole } from "../middlewares/auth.middleware";

const organisationRoutes = Router();

// La gestion des organisations est réservée à l'administration
organisationRoutes.post("/", exigerRole("admin"), controller.creer);
organisationRoutes.put("/:id", exigerRole("admin"), controller.modifier);
organisationRoutes.delete("/:id", exigerRole("admin"), controller.supprimer);

// La consultation est ouverte à tout utilisateur authentifié
organisationRoutes.get("/", controller.lister);
organisationRoutes.get("/:id", controller.obtenir);

export { organisationRoutes };