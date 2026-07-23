import express, { type Express, type Request, type Response } from "express";

const app: Express = express();
const router = express.Router;

app.use(express.json());

export { app, router };
