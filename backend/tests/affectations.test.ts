import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../src/app";
import { prisma } from "../src/config/prisma";
import {
  creerUtilisateurTest,
  enteteAuth,
  jettonPour,
  viderTables,
} from "./helpers";

let jetton: Record<string, string> = {};
let utilisateurId = 0;
let equipementId = 0;

async function creerEquipement(numSerie: string): Promise<number> {
  const reponse = await request(app)
    .post("/api/equipements")
    .set(jetton)
    .send({
      nom: `Matériel ${numSerie}`,
      type: "Ordinateur portable",
      marque: "Dell",
      prix: 1000,
      numSerie,
    });
  return reponse.body.id as number;
}

beforeAll(async () => {
  await viderTables();
  const utilisateur = await creerUtilisateurTest({
    email: "affectations@exemple.com",
  });
  utilisateurId = utilisateur.id;
  jetton = enteteAuth(jettonPour(utilisateur));
  equipementId = await creerEquipement("SN-AFF-0001");
});

describe("POST /api/affectations", () => {
  it("affecte un équipement : historique créé + matériel « En service »", async () => {
    const reponse = await request(app)
      .post("/api/affectations")
      .set(jetton)
      .send({
        equipementId,
        userId: utilisateurId,
        commentaire: "Remise en main propre",
      });
    expect(reponse.status).toBe(201);
    expect(reponse.body.dateFin).toBeNull();

    const equipement = await prisma.equipement.findUnique({
      where: { id: equipementId },
    });
    expect(equipement?.statut).toBe("En service");
    expect(equipement?.userId).toBe(utilisateurId);
  });

  it("clôture automatiquement l'affectation ouverte précédente", async () => {
    const seconde = await request(app)
      .post("/api/affectations")
      .set(jetton)
      .send({ equipementId, userId: utilisateurId });
    expect(seconde.status).toBe(201);

    const ouvertes = await prisma.affectation.findMany({
      where: { equipementId, dateFin: null },
    });
    expect(ouvertes).toHaveLength(1);
    expect(ouvertes[0]?.id).toBe(seconde.body.id);
  });

  it("refuse un équipement inconnu (404)", async () => {
    const reponse = await request(app)
      .post("/api/affectations")
      .set(jetton)
      .send({ equipementId: 99999, userId: utilisateurId });
    expect(reponse.status).toBe(404);
  });
});

describe("PATCH /api/affectations/:id/retour", () => {
  it("clôture l'affectation : dateFin renseignée, matériel « En stock »", async () => {
    const ouvertes = await prisma.affectation.findMany({
      where: { equipementId, dateFin: null },
    });
    const idOuverte = ouvertes[0]?.id;
    expect(idOuverte).toBeDefined();

    const reponse = await request(app)
      .patch(`/api/affectations/${idOuverte}/retour`)
      .set(jetton);
    expect(reponse.status).toBe(200);
    expect(reponse.body.dateFin).not.toBeNull();

    const equipement = await prisma.equipement.findUnique({
      where: { id: equipementId },
    });
    expect(equipement?.statut).toBe("En stock");
    expect(equipement?.userId).toBeNull();
  });

  it("refuse de clôturer une affectation déjà clôturée (400)", async () => {
    const historique = await prisma.affectation.findMany({
      where: { equipementId },
    });
    const cloturee = historique.find((a) => a.dateFin !== null);
    expect(cloturee).toBeDefined();

    const reponse = await request(app)
      .patch(`/api/affectations/${cloturee?.id}/retour`)
      .set(jetton);
    expect(reponse.status).toBe(400);
  });
});