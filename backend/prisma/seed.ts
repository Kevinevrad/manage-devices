import { prisma } from "../src/config/prisma";

async function main() {
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      nom: "Assoko",
      prenom: "Kevin",
      structure: "infratp",
      email: "kevin.assoko@infratp.com",
      service: "Informatique",
    },
  });
}
