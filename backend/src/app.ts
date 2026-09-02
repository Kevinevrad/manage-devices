import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { CORS_ORIGINS } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { apiRouter } from "./routes";

const app: Express = express();

// En-têtes de sécurité HTTP (X-Content-Type-Options, X-Frame-Options, HSTS…)
app.use(helmet());

// CORS restrictif : seules les origines déclarées dans CORS_ORIGIN (.env)
// reçoivent les en-têtes d'autorisation. Les requêtes sans en-tête Origin
// (curl, appel serveur à serveur, tests) ne sont pas concernées par CORS.
app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Toutes les routes métier sont montées sous le préfixe /api
app.use("/api", apiRouter);

// Routes inconnues puis gestion centralisée des erreurs (toujours en dernier)
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
