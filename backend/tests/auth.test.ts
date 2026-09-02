import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../src/app";
import {
  creerUtilisateurTest,
  enteteAuth,
  jettonPour,
  MOT_DE_PASSE_TEST,
  viderTables,
} from "./helpers";

let admin: { id: number; role: string; email: string } = {
  id: 0,
  role: "user",
  email: "",
};

beforeAll(async () => {
  await viderTables();
  const cree = await creerUtilisateurTest({
    role: "admin",
    email: "admin@exemple.com",
  });
  admin = { id: cree.id, role: cree.role, email: cree.email };
});

describe("POST /api/auth/inscrire", () => {
  it("crée un compte (201), rôle forcé à « user », sans exposer le hash", async () => {
    const reponse = await request(app).post("/api/auth/inscrire").send({
      nom: "Nouveau",
      prenom: "Compte",
      email: "nouveau@exemple.com",
      motDePasse: MOT_DE_PASSE_TEST,
      structure: "test",
      service: "Test",
    });

    expect(reponse.status).toBe(201);
    expect(reponse.body.utilisateur.role).toBe("user");
    expect(reponse.body.utilisateur.nomComplet).toBe("Compte Nouveau");
    expect(reponse.body.utilisateur).not.toHaveProperty("motDePasse");
    expect(typeof reponse.body.jetton).toBe("string");
    expect(reponse.body.jetton.length).toBeGreaterThan(0);
  });

  it("refuse un mot de passe trop court (400)", async () => {
    const reponse = await request(app).post("/api/auth/inscrire").send({
      nom: "Court",
      prenom: "Trop",
      email: "court@exemple.com",
      motDePasse: "abc",
      structure: "test",
      service: "Test",
    });
    expect(reponse.status).toBe(400);
  });

  it("refuse un e-mail mal formé (400)", async () => {
    const reponse = await request(app).post("/api/auth/inscrire").send({
      nom: "Mal",
      prenom: "Forme",
      email: "pas-un-email",
      motDePasse: MOT_DE_PASSE_TEST,
      structure: "test",
      service: "Test",
    });
    expect(reponse.status).toBe(400);
  });

  it("refuse un e-mail déjà pris (409)", async () => {
    const reponse = await request(app).post("/api/auth/inscrire").send({
      nom: "Doublon",
      prenom: "Email",
      email: "admin@exemple.com",
      motDePasse: MOT_DE_PASSE_TEST,
      structure: "test",
      service: "Test",
    });
    expect(reponse.status).toBe(409);
  });
});

describe("POST /api/auth/connecter", () => {
  it("connecte un compte valide (200) et renvoie un jeton", async () => {
    const reponse = await request(app).post("/api/auth/connecter").send({
      email: "admin@exemple.com",
      motDePasse: MOT_DE_PASSE_TEST,
    });
    expect(reponse.status).toBe(200);
    expect(reponse.body.utilisateur.email).toBe("admin@exemple.com");
    expect(typeof reponse.body.jetton).toBe("string");
    expect(reponse.body.jetton.length).toBeGreaterThan(0);
  });

  it("refuse un mauvais mot de passe (401)", async () => {
    const reponse = await request(app).post("/api/auth/connecter").send({
      email: "admin@exemple.com",
      motDePasse: "MauvaisMotDePasse1!",
    });
    expect(reponse.status).toBe(401);
  });

  it("refuse un e-mail inconnu (401)", async () => {
    const reponse = await request(app).post("/api/auth/connecter").send({
      email: "inconnu@exemple.com",
      motDePasse: MOT_DE_PASSE_TEST,
    });
    expect(reponse.status).toBe(401);
  });
});

describe("GET /api/auth/moi", () => {
  it("exige un jeton (401 sans Authorization)", async () => {
    const reponse = await request(app).get("/api/auth/moi");
    expect(reponse.status).toBe(401);
  });

  it("renvoie le profil de l'utilisateur authentifié (200)", async () => {
    const reponse = await request(app)
      .get("/api/auth/moi")
      .set(enteteAuth(jettonPour(admin)));
    expect(reponse.status).toBe(200);
    expect(reponse.body.email).toBe("admin@exemple.com");
    expect(reponse.body).not.toHaveProperty("motDePasse");
  });

  it("refuse un jeton falsifié (401)", async () => {
    const reponse = await request(app)
      .get("/api/auth/moi")
      .set(enteteAuth("jeton-invalide"));
    expect(reponse.status).toBe(401);
  });
});

describe("Routes métier protégées", () => {
  it("GET /api/equipements sans jeton → 401", async () => {
    const reponse = await request(app).get("/api/equipements");
    expect(reponse.status).toBe(401);
  });

  it("GET /api/equipements avec jeton → 200 (tableau)", async () => {
    const reponse = await request(app)
      .get("/api/equipements")
      .set(enteteAuth(jettonPour(admin)));
    expect(reponse.status).toBe(200);
    expect(Array.isArray(reponse.body)).toBe(true);
  });

  it("DELETE /api/users/:id est réservé aux admins (403 pour un user)", async () => {
    const simple = await creerUtilisateurTest({ email: "simple@exemple.com" });
    const reponse = await request(app)
      .delete(`/api/users/${simple.id}`)
      .set(enteteAuth(jettonPour({ id: simple.id, role: simple.role })));
    expect(reponse.status).toBe(403);
  });

  it("GET /api/users n'expose jamais le hash du mot de passe", async () => {
    const reponse = await request(app)
      .get("/api/users")
      .set(enteteAuth(jettonPour(admin)));
    expect(reponse.status).toBe(200);
    for (const utilisateur of reponse.body) {
      expect(utilisateur).not.toHaveProperty("motDePasse");
    }
  });

  it("GET /api/affectations n'expose jamais le hash du mot de passe", async () => {
    const reponse = await request(app)
      .get("/api/affectations")
      .set(enteteAuth(jettonPour(admin)));
    expect(reponse.status).toBe(200);
    for (const affectation of reponse.body) {
      expect(affectation.user).not.toHaveProperty("motDePasse");
    }
  });
});