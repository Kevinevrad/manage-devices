import type { Request, Response } from "express";

import * as authService from "../services/auth.service";

/** POST /api/auth/inscrire — création de compte + jeton de session. */
export async function inscrire(req: Request, res: Response): Promise<void> {
  const reponse = await authService.inscrire(req.body);
  res.status(201).json(reponse);
}

/** POST /api/auth/connecter — vérifie les identifiants et renvoie un jeton. */
export async function connecter(req: Request, res: Response): Promise<void> {
  res.json(await authService.connecter(req.body));
}

/** GET /api/auth/moi — profil de l'utilisateur authentifié. */
export async function moi(req: Request, res: Response): Promise<void> {
  const authentifie = req.utilisateur;
  if (authentifie === undefined) {
    res.status(401).json({ error: "Authentification requise." });
    return;
  }
  res.json(await authService.moi(authentifie.id));
}