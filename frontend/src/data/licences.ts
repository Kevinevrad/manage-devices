import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconCurrencyEuro,
  IconUsers,
} from "@tabler/icons-react";

import type { MetricsCardData } from "@/components";
import { formatEuros } from "@/lib/format";

/**
 * Données de démonstration pour la page « Licences ».
 * À remplacer plus tard par les données de l'API.
 */

export type LicenceType = "Abonnement" | "Perpétuelle";

export type LicenceStatut = "Active" | "Expire bientôt" | "Expirée";

export const licenceStatuts: LicenceStatut[] = [
  "Active",
  "Expire bientôt",
  "Expirée",
];

export interface Licence {
  id: number;
  logiciel: string;
  editeur: string;
  /** Clé de produit ou identifiant d'abonnement */
  cle: string;
  type: LicenceType;
  siegesUtilises: number;
  siegesTotal: number;
  /** Date d'expiration au format ISO — null pour une licence perpétuelle */
  dateExpiration: string | null;
  /** Coût annuel en euros — null pour une licence perpétuelle */
  coutAnnuel: number | null;
}

export const licences: Licence[] = [
  { id: 1, logiciel: "Microsoft 365 Business", editeur: "Microsoft", cle: "MSN-365-BIZ-8842", type: "Abonnement", siegesUtilises: 24, siegesTotal: 30, dateExpiration: "2026-11-30", coutAnnuel: 3600 },
  { id: 2, logiciel: "Adobe Creative Cloud", editeur: "Adobe", cle: "ADO-CC-TEAM-1177", type: "Abonnement", siegesUtilises: 6, siegesTotal: 8, dateExpiration: "2026-10-15", coutAnnuel: 7200 },
  { id: 3, logiciel: "Windows 11 Pro", editeur: "Microsoft", cle: "W11P-OEM-0091", type: "Perpétuelle", siegesUtilises: 42, siegesTotal: 50, dateExpiration: null, coutAnnuel: null },
  { id: 4, logiciel: "Notion Business", editeur: "Notion", cle: "NTN-BIZ-3320", type: "Abonnement", siegesUtilises: 18, siegesTotal: 20, dateExpiration: "2027-02-28", coutAnnuel: 2160 },
  { id: 5, logiciel: "Slack Pro", editeur: "Salesforce", cle: "SLK-PRO-5510", type: "Abonnement", siegesUtilises: 26, siegesTotal: 26, dateExpiration: "2027-01-31", coutAnnuel: 9360 },
  { id: 6, logiciel: "ESET PROTECT Entry", editeur: "ESET", cle: "ESET-PROT-078", type: "Abonnement", siegesUtilises: 55, siegesTotal: 60, dateExpiration: "2026-09-12", coutAnnuel: 1800 },
  { id: 7, logiciel: "Figma Organization", editeur: "Figma", cle: "FIG-ORG-2210", type: "Abonnement", siegesUtilises: 9, siegesTotal: 10, dateExpiration: "2027-03-01", coutAnnuel: 5400 },
  { id: 8, logiciel: "Zoom Business", editeur: "Zoom", cle: "ZOOM-BIZ-4419", type: "Abonnement", siegesUtilises: 12, siegesTotal: 15, dateExpiration: "2026-08-15", coutAnnuel: 2400 },
  { id: 9, logiciel: "AutoCAD LT", editeur: "Autodesk", cle: "ACAD-LT-114", type: "Perpétuelle", siegesUtilises: 4, siegesTotal: 5, dateExpiration: null, coutAnnuel: null },
  { id: 10, logiciel: "Jira Premium", editeur: "Atlassian", cle: "JIRA-PRM-6612", type: "Abonnement", siegesUtilises: 14, siegesTotal: 14, dateExpiration: "2026-12-01", coutAnnuel: 6300 },
  { id: 11, logiciel: "Acrobat Pro", editeur: "Adobe", cle: "ACR-PRO-7731", type: "Abonnement", siegesUtilises: 10, siegesTotal: 12, dateExpiration: "2026-09-25", coutAnnuel: 1440 },
  { id: 12, logiciel: "Office 2019 Standard", editeur: "Microsoft", cle: "OFF19-VL-005", type: "Perpétuelle", siegesUtilises: 8, siegesTotal: 10, dateExpiration: null, coutAnnuel: null },
];

const JOURS_EN_MS = 86_400_000;

/** Nombre de jours restants avant expiration (Infinity pour une licence perpétuelle). */
export function joursAvantExpiration(licence: Licence): number {
  if (!licence.dateExpiration) return Number.POSITIVE_INFINITY;
  const difference = new Date(licence.dateExpiration).getTime() - Date.now();
  return Math.ceil(difference / JOURS_EN_MS);
}

/** Statut calculé dynamiquement à partir de la date d'expiration. */
export function getLicenceStatut(licence: Licence): LicenceStatut {
  const jours = joursAvantExpiration(licence);
  if (jours < 0) return "Expirée";
  if (jours <= 30) return "Expire bientôt";
  return "Active";
}

export const licencesStats: MetricsCardData[] = [
  {
    id: "licences-actives",
    label: "Licences actives",
    value: licences.filter((l) => getLicenceStatut(l) !== "Expirée").length,
    icon: IconCircleCheck,
    variant: "teal",
    trend: 6,
  },
  {
    id: "sieges-occupes",
    label: "Sièges occupés",
    value: `${licences.reduce((total, l) => total + l.siegesUtilises, 0)} / ${licences.reduce((total, l) => total + l.siegesTotal, 0)}`,
    icon: IconUsers,
    variant: "indigo",
    trend: 4,
  },
  {
    id: "licences-expirant",
    label: "Expirent sous 30 jours",
    value: licences.filter((l) => getLicenceStatut(l) === "Expire bientôt")
      .length,
    icon: IconAlertTriangle,
    variant: "pink",
  },
  {
    id: "licences-expirees",
    label: "Licences expirées",
    value: licences.filter((l) => getLicenceStatut(l) === "Expirée").length,
    icon: IconCircleX,
    variant: "red",
    trend: 2,
  },
  {
    id: "cout-annuel",
    label: "Coût annuel des abonnements",
    value: formatEuros(
      licences.reduce((total, l) => total + (l.coutAnnuel ?? 0), 0),
    ),
    icon: IconCurrencyEuro,
    variant: "olive",
  },
];