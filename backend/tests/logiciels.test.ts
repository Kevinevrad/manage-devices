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
let equipementA = 0;
let equipementB = 0;
let licenceLimitee = 0; // siegesTotal = 1

async function creerEquipement(numSerie: string): Promise<number> {
  const reponse = await request(app)
    .post("/api/equipements")
    .set(jetton)
    .send({
      nom: `Poste ${numSerie}`,
      type: "Poste fixe",
      marque: "HP",
      prix: 800,
      numSerie,
    });
  return reponse.body.id as number;
}

async function creerLogiciel(
  cle: string,
  siegesTotal: number | null,
): Promise<number> {
  const reponse = await request(app)
    .post("/api/logiciels")
    .set(jetton)
    .send({
      nom: `Logiciel ${cle}`,
      editeur: "Éditeur Test",
      cleLicence: cle,
      typeLicence: "Abonnement",
      siegesTotal,
      coutAnnuel: 1200,
    });
  expect(reponse.status).toBe(201);
  return reponse.body.id as number;
}

beforeAll(async () => {
  await viderTables();
  const utilisateur = await creerUtilisateurTest({
    email: "licences@exemple.com",
  });
  jetton = enteteAuth(jettonPour(utilisateur));
  equipementA = await creerEquipement("SN-LIC-0001");
  equipementB = await creerEquipement("SN-LIC-0002");
  licenceLimitee = await creerLogiciel("LIC-TEST-1-SIEGE", 1);
});

describe("POST /api/logiciels", () => {
  it("refuse une clé de licence déjà utilisée (409)", async () => {
    const reponse = await request(app)
      .post("/api/logiciels")
      .set(jetton)
      .send({
        nom: "Doublon",
        editeur: "Éditeur Test",
        cleLicence: "LIC-TEST-1-SIEGE",
      });
    expect(reponse.status).toBe(409);
  });

  it("refuse un type de licence hors liste (400)", async () => {
    const reponse = await request(app)
      .post("/api/logiciels")
      .set(jetton)
      .send({
        nom: "Type invalide",
        editeur: "Éditeur Test",
        cleLicence: "LIC-TEST-TYPE",
        typeLicence: "Gratuite",
      });
    expect(reponse.status).toBe(400);
  });
});

describe("Installation de licences (sièges)", () => {
  it("installe une licence sur un équipement (201)", async () => {
    const reponse = await request(app)
      .post(`/api/equipements/${equipementA}/logiciels`)
      .set(jetton)
      .send({ logicielId: licenceLimitee });
    expect(reponse.status).toBe(201);
    expect(reponse.body.logiciels).toHaveLength(1);
  });

  it("refuse l'installation quand tous les sièges sont pris (409)", async () => {
    const reponse = await request(app)
      .post(`/api/equipements/${equipementB}/logiciels`)
      .set(jetton)
      .send({ logicielId: licenceLimitee });
    expect(reponse.status).toBe(409);
  });

  it("refuse un logiciel inconnu (400)", async () => {
    const reponse = await request(app)
      .post(`/api/equipements/${equipementA}/logiciels`)
      .set(jetton)
      .send({ logicielId: 99999 });
    expect(reponse.status).toBe(400);
  });

  it("reflète les sièges occupés dans GET /api/logiciels", async () => {
    const reponse = await request(app)
      .get("/api/logiciels")
      .set(jetton)
      .query({ q: "LIC-TEST-1-SIEGE" });
    expect(reponse.status).toBe(200);

    const licence = reponse.body.find(
      (l: { cle: string }) => l.cle === "LIC-TEST-1-SIEGE",
    );
    expect(licence.siegesUtilises).toBe(1);
    expect(licence.siegesTotal).toBe(1);
  });

  it("désinstalle une licence (204) puis refuse une seconde fois (404)", async () => {
    const desinstallation = await request(app)
      .delete(`/api/equipements/${equipementA}/logiciels/${licenceLimitee}`)
      .set(jetton);
    expect(desinstallation.status).toBe(204);

    const repetition = await request(app)
      .delete(`/api/equipements/${equipementA}/logiciels/${licenceLimitee}`)
      .set(jetton);
    expect(repetition.status).toBe(404);
  });
});