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
let jettonUserA: Record<string, string> = {};

let orgA = 0;
let orgB = 0;
let equipementA = 0;
let equipementB = 0;

async function creerOrganisation(nom: string): Promise<number> {
  const reponse = await request(app)
    .post("/api/organisations")
    .set(jettonAdmin)
    .send({ nom });
  expect(reponse.status).toBe(201);
  return reponse.body.id as number;
}

async function creerEquipementTenant(
  numSerie: string,
  organisationId: number | null,
): Promise<number> {
  const reponse = await request(app)
    .post("/api/equipements")
    .set(jettonAdmin)
    .send({
      nom: `Matériel ${numSerie}`,
      type: "Poste fixe",
      marque: "HP",
      prix: 800,
      numSerie,
      ...(organisationId !== null ? { organisationId } : {}),
    });
  expect(reponse.status).toBe(201);
  return reponse.body.id as number;
}

beforeAll(async () => {
  await viderTables();

  // Admin de plateforme : non cloisonné (accès global)
  const admin = await creerUtilisateurTest({
    role: "admin",
    email: "tenant-admin@exemple.com",
  });
  jettonAdmin = enteteAuth(jettonPour(admin));

  orgA = await creerOrganisation("Organisation A");
  orgB = await creerOrganisation("Organisation B");

  // Utilisateur cloisonné à l'organisation A
  const userA = await creerUtilisateurTest({
    role: "user",
    email: "tenant-a@exemple.com",
  });
  await prisma.user.update({
    where: { id: userA.id },
    data: { organisationId: orgA },
  });
  jettonUserA = enteteAuth(
    jettonPour({ id: userA.id, role: "user", organisationId: orgA }),
  );

  equipementA = await creerEquipementTenant("SN-TENANT-A", orgA);
  equipementB = await creerEquipementTenant("SN-TENANT-B", orgB);
});

describe("Isolation des listes", () => {
  it("un utilisateur cloisonné ne voit que son organisation", async () => {
    const reponse = await request(app)
      .get("/api/equipements")
      .set(jettonUserA);
    expect(reponse.status).toBe(200);
    expect(reponse.body).toHaveLength(1);
    expect(reponse.body[0]?.numSerie).toBe("SN-TENANT-A");
  });

  it("l'admin (non cloisonné) voit toutes les organisations", async () => {
    const reponse = await request(app).get("/api/equipements").set(jettonAdmin);
    expect(reponse.status).toBe(200);
    expect(reponse.body).toHaveLength(2);
  });

  it("le filtre ?organisationId d'un autre tenant est ignoré", async () => {
    const reponse = await request(app)
      .get(`/api/equipements?organisationId=${orgB}`)
      .set(jettonUserA);
    expect(reponse.status).toBe(200);
    expect(reponse.body).toHaveLength(1);
    expect(reponse.body[0]?.organisation.id).toBe(orgA);
  });

  it("les organisations listées sont cloisonnées", async () => {
    const reponse = await request(app)
      .get("/api/organisations")
      .set(jettonUserA);
    expect(reponse.status).toBe(200);
    expect(reponse.body).toHaveLength(1);
    expect(reponse.body[0]?.id).toBe(orgA);
  });
});

describe("Isolation des accès par identifiant (anti-IDOR)", () => {
  it("lire un équipement d'un autre tenant renvoie 404", async () => {
    const reponse = await request(app)
      .get(`/api/equipements/${equipementB}`)
      .set(jettonUserA);
    expect(reponse.status).toBe(404);
  });

  it("supprimer un équipement d'un autre tenant renvoie 404", async () => {
    const reponse = await request(app)
      .delete(`/api/equipements/${equipementB}`)
      .set(jettonUserA);
    expect(reponse.status).toBe(404);
  });

  it("l'affectation d'un autre tenant est invisible (liste et détail)", async () => {
    const creation = await request(app)
      .post("/api/affectations")
      .set(jettonAdmin)
      .send({ equipementId: equipementB, userId: 1 });
    expect(creation.status).toBe(201);

    const liste = await request(app)
      .get("/api/affectations")
      .set(jettonUserA);
    const visible = liste.body.find(
      (a: { equipementId: number }) => a.equipementId === equipementB,
    );
    expect(visible).toBeUndefined();

    const detail = await request(app)
      .get(`/api/affectations/${creation.body.id}`)
      .set(jettonUserA);
    expect(detail.status).toBe(404);
  });
});

describe("Créations rattachées au tenant", () => {
  it("l'équipement créé hérite de l'organisation de l'utilisateur", async () => {
    const reponse = await request(app)
      .post("/api/equipements")
      .set(jettonUserA)
      .send({
        nom: "Poste user A",
        type: "Poste fixe",
        marque: "HP",
        prix: 800,
        numSerie: "SN-TENANT-C",
      });
    expect(reponse.status).toBe(201);
    expect(reponse.body.organisation).toEqual({ id: orgA, nom: "Organisation A" });
  });

  it("un utilisateur cloisonné ne peut rattacher à un autre tenant (imposé)", async () => {
    const reponse = await request(app)
      .post("/api/users")
      .set(jettonUserA)
      .send({
        nom: "Test",
        prenom: "Tenant",
        email: "tenant-forced@exemple.com",
        motDePasse: MOT_DE_PASSE_TEST,
        structure: "test",
        service: "Test",
        organisationId: orgB,
      });
    expect(reponse.status).toBe(201);
    expect(reponse.body.organisation).toEqual({
      id: orgA,
      nom: "Organisation A",
    });
  });
});