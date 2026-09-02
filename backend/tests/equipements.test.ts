import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../src/app";
import {
  creerUtilisateurTest,
  enteteAuth,
  jettonPour,
  viderTables,
} from "./helpers";

let jetton: Record<string, string> = {};
let utilisateurId = 0;

const equipementValide = {
  nom: "Latitude 5540",
  type: "Ordinateur portable",
  marque: "Dell",
  prix: 1249,
  numSerie: "SN-TEST-0001",
};

beforeAll(async () => {
  await viderTables();
  const utilisateur = await creerUtilisateurTest({
    email: "equipements@exemple.com",
  });
  utilisateurId = utilisateur.id;
  jetton = enteteAuth(jettonPour(utilisateur));
});

describe("POST /api/equipements", () => {
  it("crée un équipement (201) avec le statut par défaut « Non Affecté »", async () => {
    const reponse = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send(equipementValide);
    expect(reponse.status).toBe(201);
    expect(reponse.body.numSerie).toBe("SN-TEST-0001");
    expect(reponse.body.statut).toBe("Non Affecté");
    expect(reponse.body.affecteA).toBeNull();
  });

  it("crée un équipement directement affecté (statut « En service »)", async () => {
    const reponse = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send({
        ...equipementValide,
        numSerie: "SN-TEST-0002",
        userId: utilisateurId,
      });
    expect(reponse.status).toBe(201);
    expect(reponse.body.statut).toBe("En service");
    expect(reponse.body.userId).toBe(utilisateurId);
    expect(reponse.body.affecteA).toBe("Utilisateur Test");
  });

  it("refuse un n° de série déjà utilisé (409)", async () => {
    const reponse = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send(equipementValide);
    expect(reponse.status).toBe(409);
  });

  it("refuse un statut hors liste (400)", async () => {
    const reponse = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send({ ...equipementValide, numSerie: "SN-TEST-0003", statut: "Volé" });
    expect(reponse.status).toBe(400);
  });

  it("refuse un champ obligatoire manquant (400)", async () => {
    const { marque: _marque, ...sansMarque } = equipementValide;
    const reponse = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send({ ...sansMarque, numSerie: "SN-TEST-0004" });
    expect(reponse.status).toBe(400);
  });
});

describe("GET /api/equipements", () => {
  it("liste les équipements créés (200)", async () => {
    const reponse = await request(app).get("/api/equipements").set(jetton);
    expect(reponse.status).toBe(200);
    expect(reponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("filtre par statut (?statut=En service)", async () => {
    const reponse = await request(app)
      .get("/api/equipements?statut=En%20service")
      .set(jetton);
    expect(reponse.status).toBe(200);
    expect(reponse.body.length).toBeGreaterThanOrEqual(1);
    for (const equipement of reponse.body) {
      expect(equipement.statut).toBe("En service");
    }
  });

  it("retourne 404 pour un identifiant inconnu", async () => {
    const reponse = await request(app)
      .get("/api/equipements/99999")
      .set(jetton);
    expect(reponse.status).toBe(404);
  });
});

describe("PUT /api/equipements/:id", () => {
  it("met à jour partiellement un équipement (200)", async () => {
    const cree = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send({ ...equipementValide, numSerie: "SN-TEST-0005" });

    const reponse = await request(app)
      .put(`/api/equipements/${cree.body.id}`)
      .set(jetton)
      .send({ prix: 999, statut: "En panne" });
    expect(reponse.status).toBe(200);
    expect(reponse.body.prix).toBe(999);
    expect(reponse.body.statut).toBe("En panne");
    expect(reponse.body.nom).toBe("Latitude 5540");
  });

  it("désaffecte l'utilisateur et repasse « En stock » (userId null)", async () => {
    const cree = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send({
        ...equipementValide,
        numSerie: "SN-TEST-0006",
        userId: utilisateurId,
      });

    const reponse = await request(app)
      .put(`/api/equipements/${cree.body.id}`)
      .set(jetton)
      .send({ userId: null });
    expect(reponse.status).toBe(200);
    expect(reponse.body.userId).toBeNull();
    expect(reponse.body.statut).toBe("En stock");
  });
});

describe("DELETE /api/equipements/:id", () => {
  it("supprime un équipement (204) puis le renvoie introuvable (404)", async () => {
    const cree = await request(app)
      .post("/api/equipements")
      .set(jetton)
      .send({ ...equipementValide, numSerie: "SN-TEST-0007" });

    const suppression = await request(app)
      .delete(`/api/equipements/${cree.body.id}`)
      .set(jetton);
    expect(suppression.status).toBe(204);

    const lecture = await request(app)
      .get(`/api/equipements/${cree.body.id}`)
      .set(jetton);
    expect(lecture.status).toBe(404);
  });
});