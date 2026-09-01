import {
  IconCircleCheck,
  IconCurrencyEuro,
  IconDevices,
  IconPackage,
  IconTool,
} from "@tabler/icons-react";

import type { MetricsCardData } from "@/components";
import { formatEuros } from "@/lib/format";

/**
 * Données de démonstration pour la page « Équipements ».
 * Structure alignée sur le modèle Prisma `Equipement` du backend.
 * À remplacer plus tard par les données de l'API.
 */

export type EquipementStatut =
  | "Non Affecté"
  | "En service"
  | "En stock"
  | "En panne"
  | "Rebut";

export const equipementStatuts: EquipementStatut[] = [
  "Non Affecté",
  "En service",
  "En stock",
  "En panne",
  "Rebut",
];

export interface Equipement {
  id: number;
  nom: string;
  type: string;
  marque: string;
  numSerie: string;
  statut: EquipementStatut;
  /** Date d'achat au format ISO (AAAA-MM-JJ) */
  dateAchat: string;
  /** Utilisateur à qui l'équipement est affecté (null si non affecté) */
  affecteA: string | null;
  /** Prix d'achat en euros */
  prix: number;
}

export const equipements: Equipement[] = [
  { id: 1, nom: "Latitude 5540", type: "Ordinateur portable", marque: "Dell", numSerie: "SN-LAP-0451", statut: "En service", dateAchat: "2024-02-14", affecteA: "Kevin Assoko", prix: 1249 },
  { id: 2, nom: "MacBook Pro 14 M3", type: "Ordinateur portable", marque: "Apple", numSerie: "SN-LAP-0452", statut: "En service", dateAchat: "2024-05-03", affecteA: "Awa Diallo", prix: 2199 },
  { id: 3, nom: "EliteDesk 800 G9", type: "Poste fixe", marque: "HP", numSerie: "SN-FIX-0107", statut: "En service", dateAchat: "2023-11-20", affecteA: "Marc Lefèvre", prix: 899 },
  { id: 4, nom: "ThinkPad T14 Gen 4", type: "Ordinateur portable", marque: "Lenovo", numSerie: "SN-LAP-0453", statut: "En stock", dateAchat: "2024-06-10", affecteA: null, prix: 1149 },
  { id: 5, nom: "UltraSharp U2723QE", type: "Écran", marque: "Dell", numSerie: "SN-ECR-0233", statut: "En service", dateAchat: "2024-01-08", affecteA: "Kevin Assoko", prix: 549 },
  { id: 6, nom: "LaserJet Pro M404dn", type: "Imprimante", marque: "HP", numSerie: "SN-IMP-0019", statut: "En panne", dateAchat: "2022-09-30", affecteA: null, prix: 329 },
  { id: 7, nom: "iPhone 13", type: "Smartphone", marque: "Apple", numSerie: "SN-MOB-0088", statut: "En service", dateAchat: "2023-03-15", affecteA: "Sarah Benali", prix: 759 },
  { id: 8, nom: "Dock WD19TCS", type: "Station d'accueil", marque: "Dell", numSerie: "SN-DCK-0042", statut: "En stock", dateAchat: "2024-04-22", affecteA: null, prix: 219 },
  { id: 9, nom: "ThinkCentre M70q", type: "Poste fixe", marque: "Lenovo", numSerie: "SN-FIX-0108", statut: "En service", dateAchat: "2024-03-02", affecteA: "Hugo Petit", prix: 749 },
  { id: 10, nom: "Zenbook 14 OLED", type: "Ordinateur portable", marque: "Asus", numSerie: "SN-LAP-0454", statut: "En stock", dateAchat: "2024-07-18", affecteA: null, prix: 999 },
  { id: 11, nom: "Latitude 3520", type: "Ordinateur portable", marque: "Dell", numSerie: "SN-LAP-0121", statut: "Rebut", dateAchat: "2021-06-01", affecteA: null, prix: 649 },
  { id: 12, nom: "Galaxy S22", type: "Smartphone", marque: "Samsung", numSerie: "SN-MOB-0089", statut: "En service", dateAchat: "2023-08-11", affecteA: "Marc Lefèvre", prix: 699 },
  { id: 13, nom: "iMac 24 M1", type: "Poste fixe", marque: "Apple", numSerie: "SN-FIX-0109", statut: "En panne", dateAchat: "2022-01-25", affecteA: null, prix: 1449 },
  { id: 14, nom: "P2422H", type: "Écran", marque: "Dell", numSerie: "SN-ECR-0234", statut: "En stock", dateAchat: "2024-02-27", affecteA: null, prix: 229 },
];

/** Catégories (types) distinctes du parc, dans l'ordre d'apparition. */
export const equipementCategories: string[] = [
  ...new Set(equipements.map((equipement) => equipement.type)),
];

/** Nombre d'équipements d'une catégorie donnée. */
export const compterParCategorie = (categorie: string): number =>
  equipements.filter((equipement) => equipement.type === categorie).length;

const countByStatut = (statut: EquipementStatut) =>
  equipements.filter((equipement) => equipement.statut === statut).length;

export const equipementsStats: MetricsCardData[] = [
  {
    id: "total-equipements",
    label: "Équipements inventoriés",
    value: equipements.length,
    icon: IconDevices,
    variant: "default",
    trend: 5,
  },
  {
    id: "equipements-en-service",
    label: "En service",
    value: countByStatut("En service"),
    icon: IconCircleCheck,
    variant: "teal",
    trend: 8,
  },
  {
    id: "equipements-en-stock",
    label: "En stock",
    value: countByStatut("En stock"),
    icon: IconPackage,
    variant: "indigo",
    trend: 2,
  },
  {
    id: "equipements-en-panne",
    label: "En panne / SAV",
    value: countByStatut("En panne"),
    icon: IconTool,
    variant: "red",
    trend: -3,
  },
  {
    id: "valeur-du-parc",
    label: "Valeur du parc",
    value: formatEuros(equipements.reduce((total, e) => total + e.prix, 0)),
    icon: IconCurrencyEuro,
    variant: "olive",
  },
];