/**
 * Helpers partagés des tests : remise à zéro de la base, fixtures
 * minimales et fabrique de jetons. La base utilisée est prisma/test.db,
 * préparée par tests/global-setup.ts.
 */

import { prisma } from "../src/config/prisma";
import type { RoleUtilisateur } from "../src/domain/statuts";
import { hacherMotDePasse, signerJetton } from "../src/utils/auth";

/** Mot de passe commun aux comptes de test. */
export const MOT_DE_PASSE_TEST = "Password123!";

/** Vide toutes les tables (ordre respectant les clés étrangères). */
export async function viderTables(): Promise<void> {
  await prisma.licencesSurEquipement.deleteMany();
  await prisma.affectation.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.logiciel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();
}

interface OptionsUtilisateur {
  role?: RoleUtilisateur;
  email?: string;
}

/** Crée un utilisateur de test (mot de passe hashé) et le renvoie. */
export async function creerUtilisateurTest(options: OptionsUtilisateur = {}) {
  const suffixe = Math.random().toString(36).slice(2, 10);
  return prisma.user.create({
    data: {
      nom: "Test",
      prenom: "Utilisateur",
      email: options.email ?? `utilisateur-${suffixe}@exemple.com`,
      motDePasse: await hacherMotDePasse(MOT_DE_PASSE_TEST),
      structure: "test",
      service: "Test",
      role: options.role ?? "user",
    },
  });
}

/** Fabrique un JWT de test pour l'utilisateur donné. */
export function jettonPour(utilisateur: {
  id: number;
  role: string;
  organisationId?: number | null;
}): string {
  return signerJetton({
    id: utilisateur.id,
    role: utilisateur.role,
    organisationId: utilisateur.organisationId ?? null,
  });
}

/** En-tête Authorization prêt pour supertest. */
export function enteteAuth(jeton: string): Record<string, string> {
  return { Authorization: `Bearer ${jeton}` };
}