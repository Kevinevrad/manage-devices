import { Router } from "express";

import * as controller from "../controllers/auth.controller";
import { exigerAuthentification } from "../middlewares/auth.middleware";

const authRoutes = Router();

// Routes publiques : création de compte et connexion
authRoutes.post("/inscrire", controller.inscrire);
authRoutes.post("/connecter", controller.connecter);
// Route protégée : profil de l'utilisateur porteur du jeton
authRoutes.get("/moi", exigerAuthentification, controller.moi);

export { authRoutes };