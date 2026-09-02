import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app";

describe("En-têtes de sécurité (helmet)", () => {
  it("ajoute les en-têtes de sécurité sur une réponse publique", async () => {
    const reponse = await request(app).get("/api/health");
    expect(reponse.status).toBe(200);
    expect(reponse.headers["x-content-type-options"]).toBe("nosniff");
    expect(reponse.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(reponse.headers["x-dns-prefetch-control"]).toBe("off");
  });
});

describe("CORS restrictif", () => {
  it("autorise une origine déclarée (Access-Control-Allow-Origin renvoyé)", async () => {
    const reponse = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");
    expect(reponse.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("refuse une origine inconnue (aucun en-tête CORS renvoyé)", async () => {
    const reponse = await request(app)
      .get("/api/health")
      .set("Origin", "http://site-malveillant.example");
    expect(reponse.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("répond aux requêtes préliminaires (preflight) d'une origine autorisée", async () => {
    const reponse = await request(app)
      .options("/api/equipements")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type, Authorization");
    expect(reponse.status).toBe(204);
    expect(reponse.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(reponse.headers["access-control-allow-headers"]).toContain(
      "Authorization",
    );
  });

  it("laisse passer les requêtes sans en-tête Origin (curl, tests)", async () => {
    const reponse = await request(app).get("/api/health");
    expect(reponse.status).toBe(200);
  });
});
