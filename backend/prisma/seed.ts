import { prisma } from "../src/config/prisma";
import type { RoleUtilisateur } from "../src/domain/statuts";
import {
  StatutEquipement,
  TypeLicence,
  statutEquipementDepuisLibelle,
  typeLicenceDepuisLibelle,
} from "../src/domain/statuts";
import { hacherMotDePasse } from "../src/utils/auth";

/**
 * Jeu de données initial aligné sur les données de démonstration du frontend
 * (frontend/src/data/equipements.ts et frontend/src/data/licences.ts).
 * Réinitialise toutes les tables puis recrée un parc réaliste :
 * utilisateurs, équipements, affectations, licences et installations.
 */

/** Mot de passe commun aux comptes de démonstration. */
const MOT_DE_PASSE_DEMO = "Password123!";

interface UtilisateurSeed {
  nom: string;
  prenom: string;
  email: string;
  structure: string;
  service: string;
  role: RoleUtilisateur;
}

const utilisateursSeed: UtilisateurSeed[] = [
  { nom: "Assoko", prenom: "Kevin", email: "kevin.assoko@infratp.com", structure: "infratp", service: "Informatique", role: "admin" },
  { nom: "Diallo", prenom: "Awa", email: "awa.diallo@infratp.com", structure: "infratp", service: "Comptabilité", role: "user" },
  { nom: "Lefèvre", prenom: "Marc", email: "marc.lefevre@infratp.com", structure: "infratp", service: "Logistique", role: "technicien" },
  { nom: "Benali", prenom: "Sarah", email: "sarah.benali@infratp.com", structure: "infratp", service: "Commercial", role: "user" },
  { nom: "Petit", prenom: "Hugo", email: "hugo.petit@infratp.com", structure: "infratp", service: "Marketing", role: "user" },
];

interface EquipementSeed {
  nom: string;
  type: string;
  marque: string;
  numSerie: string;
  statut: string;
  dateAchat: string;
  prix: number;
  /** Nom complet de l'utilisateur à qui l'équipement est affecté. */
  affecteA?: string;
}

const equipementsSeed: EquipementSeed[] = [
  { nom: "Latitude 5540", type: "Ordinateur portable", marque: "Dell", numSerie: "SN-LAP-0451", statut: "En service", dateAchat: "2024-02-14", prix: 1249, affecteA: "Kevin Assoko" },
  { nom: "MacBook Pro 14 M3", type: "Ordinateur portable", marque: "Apple", numSerie: "SN-LAP-0452", statut: "En service", dateAchat: "2024-05-03", prix: 2199, affecteA: "Awa Diallo" },
  { nom: "EliteDesk 800 G9", type: "Poste fixe", marque: "HP", numSerie: "SN-FIX-0107", statut: "En service", dateAchat: "2023-11-20", prix: 899, affecteA: "Marc Lefèvre" },
  { nom: "ThinkPad T14 Gen 4", type: "Ordinateur portable", marque: "Lenovo", numSerie: "SN-LAP-0453", statut: "En stock", dateAchat: "2024-06-10", prix: 1149 },
  { nom: "UltraSharp U2723QE", type: "Écran", marque: "Dell", numSerie: "SN-ECR-0233", statut: "En service", dateAchat: "2024-01-08", prix: 549, affecteA: "Kevin Assoko" },
  { nom: "LaserJet Pro M404dn", type: "Imprimante", marque: "HP", numSerie: "SN-IMP-0019", statut: "En panne", dateAchat: "2022-09-30", prix: 329 },
  { nom: "iPhone 13", type: "Smartphone", marque: "Apple", numSerie: "SN-MOB-0088", statut: "En service", dateAchat: "2023-03-15", prix: 759, affecteA: "Sarah Benali" },
  { nom: "Dock WD19TCS", type: "Station d'accueil", marque: "Dell", numSerie: "SN-DCK-0042", statut: "En stock", dateAchat: "2024-04-22", prix: 219 },
  { nom: "ThinkCentre M70q", type: "Poste fixe", marque: "Lenovo", numSerie: "SN-FIX-0108", statut: "En service", dateAchat: "2024-03-02", prix: 749, affecteA: "Hugo Petit" },
  { nom: "Zenbook 14 OLED", type: "Ordinateur portable", marque: "Asus", numSerie: "SN-LAP-0454", statut: "En stock", dateAchat: "2024-07-18", prix: 999 },
  { nom: "Latitude 3520", type: "Ordinateur portable", marque: "Dell", numSerie: "SN-LAP-0121", statut: "Rebut", dateAchat: "2021-06-01", prix: 649 },
  { nom: "Galaxy S22", type: "Smartphone", marque: "Samsung", numSerie: "SN-MOB-0089", statut: "En service", dateAchat: "2023-08-11", prix: 699, affecteA: "Marc Lefèvre" },
  { nom: "iMac 24 M1", type: "Poste fixe", marque: "Apple", numSerie: "SN-FIX-0109", statut: "En panne", dateAchat: "2022-01-25", prix: 1449 },
  { nom: "P2422H", type: "Écran", marque: "Dell", numSerie: "SN-ECR-0234", statut: "En stock", dateAchat: "2024-02-27", prix: 229 },
];

interface LogicielSeed {
  nom: string;
  editeur: string;
  cleLicence: string;
  typeLicence: string;
  siegesTotal: number;
  /** Nombre de sièges réellement occupés (installations créées par le seed). */
  siegesUtilises: number;
  /** Date d'expiration ISO — null pour une licence perpétuelle. */
  dateExp: string | null;
  coutAnnuel: number | null;
}

const logicielsSeed: LogicielSeed[] = [
  { nom: "Microsoft 365 Business", editeur: "Microsoft", cleLicence: "MSN-365-BIZ-8842", typeLicence: "Abonnement", siegesTotal: 30, siegesUtilises: 24, dateExp: "2026-11-30", coutAnnuel: 3600 },
  { nom: "Adobe Creative Cloud", editeur: "Adobe", cleLicence: "ADO-CC-TEAM-1177", typeLicence: "Abonnement", siegesTotal: 8, siegesUtilises: 6, dateExp: "2026-10-15", coutAnnuel: 7200 },
  { nom: "Windows 11 Pro", editeur: "Microsoft", cleLicence: "W11P-OEM-0091", typeLicence: "Perpétuelle", siegesTotal: 50, siegesUtilises: 42, dateExp: null, coutAnnuel: null },
  { nom: "Notion Business", editeur: "Notion", cleLicence: "NTN-BIZ-3320", typeLicence: "Abonnement", siegesTotal: 20, siegesUtilises: 18, dateExp: "2027-02-28", coutAnnuel: 2160 },
  { nom: "Slack Pro", editeur: "Salesforce", cleLicence: "SLK-PRO-5510", typeLicence: "Abonnement", siegesTotal: 26, siegesUtilises: 26, dateExp: "2027-01-31", coutAnnuel: 9360 },
  { nom: "ESET PROTECT Entry", editeur: "ESET", cleLicence: "ESET-PROT-078", typeLicence: "Abonnement", siegesTotal: 60, siegesUtilises: 55, dateExp: "2026-09-12", coutAnnuel: 1800 },
  { nom: "Figma Organization", editeur: "Figma", cleLicence: "FIG-ORG-2210", typeLicence: "Abonnement", siegesTotal: 10, siegesUtilises: 9, dateExp: "2027-03-01", coutAnnuel: 5400 },
  { nom: "Zoom Business", editeur: "Zoom", cleLicence: "ZOOM-BIZ-4419", typeLicence: "Abonnement", siegesTotal: 15, siegesUtilises: 12, dateExp: "2026-08-15", coutAnnuel: 2400 },
  { nom: "AutoCAD LT", editeur: "Autodesk", cleLicence: "ACAD-LT-114", typeLicence: "Perpétuelle", siegesTotal: 5, siegesUtilises: 4, dateExp: null, coutAnnuel: null },
  { nom: "Jira Premium", editeur: "Atlassian", cleLicence: "JIRA-PRM-6612", typeLicence: "Abonnement", siegesTotal: 14, siegesUtilises: 14, dateExp: "2026-12-01", coutAnnuel: 6300 },
  { nom: "Acrobat Pro", editeur: "Adobe", cleLicence: "ACR-PRO-7731", typeLicence: "Abonnement", siegesTotal: 12, siegesUtilises: 10, dateExp: "2026-09-25", coutAnnuel: 1440 },
  { nom: "Office 2019 Standard", editeur: "Microsoft", cleLicence: "OFF19-VL-005", typeLicence: "Perpétuelle", siegesTotal: 10, siegesUtilises: 8, dateExp: null, coutAnnuel: null },
];

/** Index « prénom nom » → id utilisateur, rempli pendant la création. */
const idsParNomComplet = new Map<string, number>();

/** Retrouve l'id d'un utilisateur du seed (échoue explicitement sinon). */
function idUtilisateur(nomComplet: string): number {
  const id = idsParNomComplet.get(nomComplet);
  if (id === undefined) {
    throw new Error(`Utilisateur « ${nomComplet} » introuvable dans le seed.`);
  }
  return id;
}

async function main() {
  // Nettoyage complet — ordre respectant les clés étrangères
  await prisma.licencesSurEquipement.deleteMany();
  await prisma.affectation.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.logiciel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();

  // Organisation du parc de démonstration
  const organisation = await prisma.organisation.create({
    data: { nom: "Infratp" },
  });

  // Utilisateurs (mot de passe de démo haché par bcrypt)
  for (const utilisateur of utilisateursSeed) {
    const cree = await prisma.user.create({
      data: {
        ...utilisateur,
        motDePasse: await hacherMotDePasse(MOT_DE_PASSE_DEMO),
        organisation: { connect: { id: organisation.id } },
      },
    });
    idsParNomComplet.set(`${cree.prenom} ${cree.nom}`, cree.id);
  }

  // Équipements (+ affectation courante pour les équipements affectés)
  const equipementsCrees: { id: number; statut: string }[] = [];
  let affectations = 0;
  for (const equipement of equipementsSeed) {
    const { affecteA, dateAchat, statut, ...donnees } = equipement;
    const cree = await prisma.equipement.create({
      data: {
        ...donnees,
        // Libellé français du seed → valeur d'enum stockée en base
        statut: statutEquipementDepuisLibelle(statut) ?? StatutEquipement.NonAffecte,
        dateAchat: new Date(dateAchat),
        organisation: { connect: { id: organisation.id } },
        ...(affecteA
          ? { utilisateur: { connect: { id: idUtilisateur(affecteA) } } }
          : {}),
      },
    });
    equipementsCrees.push({ id: cree.id, statut: cree.statut });

    if (affecteA !== undefined) {
      await prisma.affectation.create({
        data: {
          equipementId: cree.id,
          userId: idUtilisateur(affecteA),
          dateDebut: new Date(dateAchat),
          commentaire: "Affectation initiale (seed)",
        },
      });
      affectations += 1;
    }
  }

  // Logiciels (licences)
  const logicielsCrees: { id: number }[] = [];
  for (const logiciel of logicielsSeed) {
    const { siegesUtilises, dateExp, typeLicence, ...donnees } = logiciel;
    const cree = await prisma.logiciel.create({
      data: {
        ...donnees,
        // Libellé français du seed → valeur d'enum stockée en base
        typeLicence: typeLicenceDepuisLibelle(typeLicence) ?? TypeLicence.Abonnement,
        organisation: { connect: { id: organisation.id } },
        ...(dateExp !== null ? { dateExp: new Date(dateExp) } : {}),
      },
    });
    logicielsCrees.push({ id: cree.id });
  }

  // Installations : chaque licence occupe ses sièges sur les équipements
  // « En service » (dans l'ordre du parc), dans la limite des sièges couverts
  const enService = equipementsCrees.filter(
    (equipement) => equipement.statut === StatutEquipement.EnService,
  );
  let installations = 0;
  for (const [index, logiciel] of logicielsCrees.entries()) {
    const seed = logicielsSeed[index];
    if (seed === undefined) continue;
    const nombre = Math.min(
      seed.siegesUtilises,
      seed.siegesTotal ?? seed.siegesUtilises,
      enService.length,
    );
    if (nombre <= 0) continue;

    const cibles = enService.slice(0, nombre);
    await prisma.licencesSurEquipement.createMany({
      data: cibles.map((equipement) => ({
        equipementId: equipement.id,
        logicielId: logiciel.id,
      })),
    });
    installations += cibles.length;
  }

  console.log(
    `Seed terminé : 1 organisation (${organisation.nom}), ${utilisateursSeed.length} utilisateurs, ${equipementsSeed.length} équipements, ${affectations} affectations, ${logicielsSeed.length} licences, ${installations} installations.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Échec du seed :", error);
    await prisma.$disconnect();
    process.exit(1);
  });
