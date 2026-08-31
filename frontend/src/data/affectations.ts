import {
  IconArchive,
  IconCalendarStats,
  IconCircleCheck,
  IconDevices,
  IconUsers,
} from "@tabler/icons-react";

import type { MetricsCardData } from "@/components";
import { equipements } from "./equipements";

/**
 * Données de démonstration pour la page « Affectations ».
 * Historique de remise du matériel du parc aux utilisateurs.
 * Structure alignée sur le modèle Prisma `Affectation` du backend.
 * À remplacer plus tard par les données de l'API.
 */

export type AffectationStatut = "Active" | "Retour planifié" | "Terminée";

export const affectationStatuts: AffectationStatut[] = [
  "Active",
  "Retour planifié",
  "Terminée",
];

export interface Affectation {
  id: number;
  /** Nom de l'équipement confié */
  equipement: string;
  /** Type d'équipement (pour l'icône de la ligne) */
  typeEquipement: string;
  /** Numéro de série de l'équipement */
  numSerie: string;
  /** Utilisateur à qui le matériel est confié */
  utilisateur: string;
  /** Service / département de l'utilisateur */
  service: string;
  /** Date de remise du matériel au format ISO (AAAA-MM-JJ) */
  dateAffectation: string;
  /** Date de retour prévue ou effective — null si sans échéance */
  dateRetour: string | null;
}

export const affectations: Affectation[] = [
  { id: 1, equipement: "Latitude 5540", typeEquipement: "Ordinateur portable", numSerie: "SN-LAP-0451", utilisateur: "Kevin Assoko", service: "Direction", dateAffectation: "2026-01-12", dateRetour: null },
  { id: 2, equipement: "MacBook Pro 14 M3", typeEquipement: "Ordinateur portable", numSerie: "SN-LAP-0452", utilisateur: "Awa Diallo", service: "Marketing", dateAffectation: "2025-09-03", dateRetour: null },
  { id: 3, equipement: "UltraSharp U2723QE", typeEquipement: "Écran", numSerie: "SN-ECR-0233", utilisateur: "Kevin Assoko", service: "Direction", dateAffectation: "2026-02-20", dateRetour: null },
  { id: 4, equipement: "iPhone 13", typeEquipement: "Smartphone", numSerie: "SN-MOB-0088", utilisateur: "Sarah Benali", service: "Commercial", dateAffectation: "2025-11-08", dateRetour: null },
  { id: 5, equipement: "Galaxy S22", typeEquipement: "Smartphone", numSerie: "SN-MOB-0089", utilisateur: "Marc Lefèvre", service: "Direction", dateAffectation: "2026-03-15", dateRetour: "2026-09-30" },
  { id: 6, equipement: "ThinkPad T14 Gen 4", typeEquipement: "Ordinateur portable", numSerie: "SN-LAP-0453", utilisateur: "Hugo Petit", service: "IT", dateAffectation: "2026-04-02", dateRetour: null },
  { id: 7, equipement: "EliteDesk 800 G9", typeEquipement: "Poste fixe", numSerie: "SN-FIX-0107", utilisateur: "Marc Lefèvre", service: "Direction", dateAffectation: "2024-12-01", dateRetour: null },
  { id: 8, equipement: "ThinkCentre M70q", typeEquipement: "Poste fixe", numSerie: "SN-FIX-0108", utilisateur: "Hugo Petit", service: "IT", dateAffectation: "2026-05-18", dateRetour: null },
  { id: 9, equipement: "Dock WD19TCS", typeEquipement: "Station d'accueil", numSerie: "SN-DCK-0042", utilisateur: "Awa Diallo", service: "Marketing", dateAffectation: "2026-06-10", dateRetour: "2026-10-15" },
  { id: 10, equipement: "P2422H", typeEquipement: "Écran", numSerie: "SN-ECR-0234", utilisateur: "Sarah Benali", service: "Commercial", dateAffectation: "2026-02-27", dateRetour: null },
  { id: 11, equipement: "Latitude 3520", typeEquipement: "Ordinateur portable", numSerie: "SN-LAP-0121", utilisateur: "Thomas Girard", service: "Support", dateAffectation: "2024-09-15", dateRetour: "2026-07-31" },
  { id: 12, equipement: "LaserJet Pro M404dn", typeEquipement: "Imprimante", numSerie: "SN-IMP-0019", utilisateur: "Nadia Cherif", service: "Support", dateAffectation: "2023-10-02", dateRetour: "2026-06-30" },
  { id: 13, equipement: "Zenbook 14 OLED", typeEquipement: "Ordinateur portable", numSerie: "SN-LAP-0454", utilisateur: "Léa Moreau", service: "Comptabilité", dateAffectation: "2026-07-21", dateRetour: null },
  { id: 14, equipement: "iMac 24 M1", typeEquipement: "Poste fixe", numSerie: "SN-FIX-0109", utilisateur: "Sophie Lambert", service: "Ressources humaines", dateAffectation: "2023-05-09", dateRetour: "2026-01-15" },
];

const JOURS_EN_MS = 86_400_000;

/** Nombre de jours restants avant le retour du matériel (Infinity si sans échéance). */
export function joursAvantRetour(affectation: Affectation): number {
  if (!affectation.dateRetour) return Number.POSITIVE_INFINITY;
  const difference = new Date(affectation.dateRetour).getTime() - Date.now();
  return Math.ceil(difference / JOURS_EN_MS);
}

/** Statut calculé dynamiquement à partir de la date de retour. */
export function getAffectationStatut(
  affectation: Affectation,
): AffectationStatut {
  if (!affectation.dateRetour) return "Active";
  return joursAvantRetour(affectation) > 0 ? "Retour planifié" : "Terminée";
}

/** Services (départements) distincts, dans l'ordre d'apparition. */
export const affectationServices: string[] = [
  ...new Set(affectations.map((affectation) => affectation.service)),
];

/** Nombre d'affectations d'un service donné. */
export const compterParService = (service: string): number =>
  affectations.filter((affectation) => affectation.service === service).length;

const affectationsActives = affectations.filter(
  (affectation) => getAffectationStatut(affectation) === "Active",
);

export const affectationsStats: MetricsCardData[] = [
  {
    id: "affectations-actives",
    label: "Affectations actives",
    value: affectationsActives.length,
    icon: IconCircleCheck,
    variant: "teal",
    trend: 5,
  },
  {
    id: "equipements-affectes",
    label: "Équipements du parc affectés",
    value: `${affectationsActives.length} / ${equipements.length}`,
    icon: IconDevices,
    variant: "indigo",
    trend: 3,
  },
  {
    id: "utilisateurs-equipes",
    label: "Utilisateurs équipés",
    value: new Set(affectationsActives.map((a) => a.utilisateur)).size,
    icon: IconUsers,
    variant: "olive",
    trend: 2,
  },
  {
    id: "retours-planifies",
    label: "Retours planifiés",
    value: affectations.filter(
      (a) => getAffectationStatut(a) === "Retour planifié",
    ).length,
    icon: IconCalendarStats,
    variant: "pink",
  },
  {
    id: "affectations-terminees",
    label: "Affectations terminées",
    value: affectations.filter((a) => getAffectationStatut(a) === "Terminée")
      .length,
    icon: IconArchive,
    variant: "default",
    trend: 1,
  },
];
