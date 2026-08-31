import { Router } from "express";

import { affectationRoutes } from "./affectation.routes";
import { equipementRoutes } from "./equipement.routes";
import { logicielRoutes } from "./logiciel.routes";
import { userRoutes } from "./user.routes";

const apiRouter = Router();

/** GET /api/health — sonde de disponibilité. */
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.use("/equipements", equipementRoutes);
apiRouter.use("/logiciels", logicielRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/affectations", affectationRoutes);

export { apiRouter };