import type { Request, Response } from "express";

/** Répond 404 (JSON) pour toute route non interceptée. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
}