import { Router } from "express";

import { exigerAuthentification } from "../middlewares/auth.middleware";
import { affectationRoutes } from "./affectation.routes";
import { authRoutes } from "./auth.routes";
import { equipementRoutes } from "./equipement.routes";
import { logicielRoutes } from "./logiciel.routes";
import { userRoutes } from "./user.routes";

const apiRouter = Router();

/** GET /api/health — sonde de disponibilité (publique). */
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentification : inscription/connexion publiques, profil protégé
apiRouter.use("/auth", authRoutes);

// Toutes les routes métier exigent désormais un JWT valide
apiRouter.use(exigerAuthentification);

apiRouter.use("/equipements", equipementRoutes);
apiRouter.use("/logiciels", logicielRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/affectations", affectationRoutes);

export { apiRouter };