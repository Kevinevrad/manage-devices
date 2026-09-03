import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../src/app";
import { prisma } from "../src/config/prisma";
import {
  MOT_DE_PASSE_TEST,
  creerUtilisateurTest,
  enteteAuth,
  jettonPour,
  viderTables,
} from "./helpers";

let jettonAdmin: Record<string, string> = {};
let jettonUser: Record<string, string> = {};
let organisationId = 0;

beforeAll(async () => {
  await viderTables();
  const admin = await creerUtilisateurTest({
    role: "admin",
    email: "org-admin@exemple.com",
  });
  const simple = await creerUtilisateurTest({
    email: "org-user@exemple.com",
  });
  jettonAdmin = enteteAuth(jettonPour(admin));
  jettonUser = enteteAuth(jettonPour(simple));
});

describe("Autorisations", () => {
  it("exige un jeton (401 sans Authorization)", async () => {
    const reponse = await request(app).get("/api/organisations");
    expect(reponse.status).toBe(401);
  });

  it("réserve la création aux admins (403 pour un user)", async () => {
    const reponse = await request(app)
      .post("/api/organisations")
      .set(jettonUser)
      .send({ nom: "Non Autorisé" });
    expect(reponse.status).toBe(403);
  });

  it("réserve la suppression aux admins (403 pour un user)", async () => {
    const creation = await request(app)
      .post("/api/organisations")
      .set(jettonAdmin)
      .send({ nom: "Temporaire" });
    expect(creation.status).toBe(201);

    const reponse = await request(app)
      .delete(`/api/organisations/${creation.body.id}`)
      .set(jettonUser);
    expect(reponse.status).toBe(403);
  });
});

describe("CRUD organisations", () => {
  it("crée une organisation (201) avec ses volumétries à zéro", async () => {
    const reponse = await request(app)
      .post("/api/organisations")
      .set(jettonAdmin)
      .send({ nom: "Infratp" });
    expect(reponse.status).toBe(201);
    expect(reponse.body.nom).toBe("Infratp");
    expect(reponse.body.utilisateurs).toBe(0);
    expect(reponse.body.equipements).toBe(0);
    expect(reponse.body.logiciels).toBe(0);
    organisationId = reponse.body.id;
  });

  it("refuse un nom déjà pris (409)", async () => {
    const reponse = await request(app)
      .post("/api/organisations")
      .set(jettonAdmin)
      .send({ nom: "Infratp" });
    expect(reponse.status).toBe(409);
  });

  it("refuse un nom manquant (400)", async () => {
    const reponse = await request(app)
      .post("/api/organisations")
      .set(jettonAdmin)
      .send({});
    expect(reponse.status).toBe(400);
  });

  it("renvoie une organisation (200) puis 404 pour une inconnue", async () => {
    expect(organisationId).toBeGreaterThan(0);

    const reponse = await request(app)
      .get(`/api/organisations/${organisationId}`)
      .set(jettonAdmin);
    expect(reponse.status).toBe(200);
    expect(reponse.body.nom).toBe("Infratp");

    const inconnue = await request(app)
      .get("/api/organisations/99999")
      .set(jettonAdmin);
    expect(inconnue.status).toBe(404);
  });

  it("renomme une organisation (200)", async () => {
    expect(organisationId).toBeGreaterThan(0);

    const reponse = await request(app)
      .put(`/api/organisations/${organisationId}`)
      .set(jettonAdmin)
      .send({ nom: "Infratp SA" });
    expect(reponse.status).toBe(200);
    expect(reponse.body.nom).toBe("Infratp SA");
  });
});

describe("Rattachement des entités", () => {
  it("crée un utilisateur rattaché à une organisation (201)", async () => {
    expect(organisationId).toBeGreaterThan(0);
    const id = organisationId;

    const reponse = await request(app)
      .post("/api/users")
      .set(jettonAdmin)
      .send({
        nom: "Test",
        prenom: "Organisation",
        email: "org-rattache@exemple.com",
        motDePasse: MOT_DE_PASSE_TEST,
        structure: "test",
        service: "Test",
        organisationId: id,
      });
    expect(reponse.status).toBe(201);
    expect(reponse.body.organisation).toEqual({ id, nom: "Infratp SA" });

    const volumetrie = await request(app)
      .get(`/api/organisations/${id}`)
      .set(jettonAdmin);
    expect(volumetrie.body.utilisateurs).toBe(1);
  });

  it("refuse un rattachement à une organisation inconnue (404)", async () => {
    const reponse = await request(app)
      .post("/api/users")
      .set(jettonAdmin)
      .send({
        nom: "Orphelin",
        prenom: "Test",
        email: "orphelin@exemple.com",
        motDePasse: MOT_DE_PASSE_TEST,
        structure: "test",
        service: "Test",
        organisationId: 99999,
      });
    expect(reponse.status).toBe(404);
  });

  it("filtre les équipements par organisation (?organisationId=…)", async () => {
    expect(organisationId).toBeGreaterThan(0);
    const id = organisationId;

    const rattache = await request(app)
      .post("/api/equipements")
      .set(jettonAdmin)
      .send({
        nom: "Poste Infratp",
        type: "Poste fixe",
        marque: "HP",
        prix: 800,
        numSerie: "SN-ORG-0001",
        organisationId: id,
      });
    expect(rattache.status).toBe(201);

    const orphelin = await request(app)
      .post("/api/equipements")
      .set(jettonAdmin)
      .send({
        nom: "Poste orphelin",
        type: "Poste fixe",
        marque: "HP",
        prix: 800,
        numSerie: "SN-ORG-0002",
      });
    expect(orphelin.status).toBe(201);

    const filtre = await request(app)
      .get(`/api/equipements?organisationId=${id}`)
      .set(jettonAdmin);
    expect(filtre.status).toBe(200);
    expect(filtre.body).toHaveLength(1);
    expect(filtre.body[0]?.numSerie).toBe("SN-ORG-0001");
    expect(filtre.body[0]?.organisation).toEqual({ id, nom: "Infratp SA" });
  });
});

describe("Suppression (SetNull)", () => {
  it("supprime l'organisation et détache les entités (204)", async () => {
    expect(organisationId).toBeGreaterThan(0);
    const id = organisationId;

    const reponse = await request(app)
      .delete(`/api/organisations/${id}`)
      .set(jettonAdmin);
    expect(reponse.status).toBe(204);

    const utilisateurs = await prisma.user.findMany({
      where: { organisationId: id },
    });
    expect(utilisateurs).toHaveLength(0);
  });
});
