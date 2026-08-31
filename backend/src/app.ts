import cors from "cors";
import express, { type Express } from "express";

import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { apiRouter } from "./routes";

const app: Express = express();

// Middleware globaux
app.use(cors()); // Autorise le frontend (Vite) à appeler l'API en développement
app.use(express.json());

// Toutes les routes métier sont montées sous le préfixe /api
app.use("/api", apiRouter);

// Routes inconnues puis gestion centralisée des erreurs (toujours en dernier)
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
