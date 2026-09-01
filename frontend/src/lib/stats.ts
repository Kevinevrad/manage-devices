/**
 * Construction des cartes de métriques à partir des données réelles de l'API.
 * Remplace les tableaux figés de src/data/*.ts (les tendances restent
 * indicatives en attendant un historique côté backend).
 */

import {
  IconAlertTriangle,
  IconArchive,
  IconCalendarStats,
  IconCircleCheck,
  IconCircleX,
  IconCurrencyEuro,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDevices,
  IconLicense,
  IconPackage,
  IconTool,
  IconUsers,
} from "@tabler/icons-react";

import type { MetricsCardData } from "@/components";
import { getAffectationStatut } from "@/data/affectations";
import type { Affectation } from "@/data/affectations";
import type { Equipement, EquipementStatut } from "@/data/equipements";
import { getLicenceStatut } from "@/data/licences";
import type { Licence } from "@/data/licences";
import { formatEuros } from "@/lib/format";

/** Nombre d'équipements pour un statut donné. */
const compterParStatut = (
  equipements: Equipement[],
  statut: EquipementStatut,
): number =>
  equipements.filter((equipement) => equipement.statut === statut).length;

/** Nombre d'équipements d'un type (catégorie) donné. */
const compterParType = (equipements: Equipement[], type: string): number =>
  equipements.filter((equipement) => equipement.type === type).length;

/** Cartes de la page « Équipements ». */
export function construireEquipementsStats(
  equipements: Equipement[],
): MetricsCardData[] {
  const valeurParc = equipements.reduce((total, e) => total + e.prix, 0);
  return [
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
      value: compterParStatut(equipements, "En service"),
      icon: IconCircleCheck,
      variant: "teal",
      trend: 8,
    },
    {
      id: "equipements-en-stock",
      label: "En stock",
      value: compterParStatut(equipements, "En stock"),
      icon: IconPackage,
      variant: "indigo",
      trend: 2,
    },
    {
      id: "equipements-en-panne",
      label: "En panne / SAV",
      value: compterParStatut(equipements, "En panne"),
      icon: IconTool,
      variant: "red",
      trend: -3,
    },
    {
      id: "valeur-du-parc",
      label: "Valeur du parc",
      value: formatEuros(valeurParc),
      icon: IconCurrencyEuro,
      variant: "olive",
    },
  ];
}

/** Cartes de la page « Licences ». */
export function construireLicencesStats(
  licences: Licence[],
): MetricsCardData[] {
  const siegesOccupes = licences.reduce(
    (total, l) => total + l.siegesUtilises,
    0,
  );
  const siegesTotal = licences.reduce((total, l) => total + l.siegesTotal, 0);
  const coutAnnuel = licences.reduce((total, l) => total + (l.coutAnnuel ?? 0), 0);
  return [
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
      value: `${siegesOccupes} / ${siegesTotal}`,
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
      value: formatEuros(coutAnnuel),
      icon: IconCurrencyEuro,
      variant: "olive",
    },
  ];
}

/** Cartes de la page « Affectations ». */
export function construireAffectationsStats(
  affectations: Affectation[],
  equipements: Equipement[],
): MetricsCardData[] {
  const actives = affectations.filter(
    (affectation) => getAffectationStatut(affectation) === "Active",
  );
  return [
    {
      id: "affectations-actives",
      label: "Affectations actives",
      value: actives.length,
      icon: IconCircleCheck,
      variant: "teal",
      trend: 5,
    },
    {
      id: "equipements-affectes",
      label: "Équipements du parc affectés",
      value: `${equipements.filter((e) => e.affecteA !== null).length} / ${equipements.length}`,
      icon: IconDevices,
      variant: "indigo",
      trend: 3,
    },
    {
      id: "utilisateurs-equipes",
      label: "Utilisateurs équipés",
      value: new Set(actives.map((a) => a.utilisateur)).size,
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
}

/** Cartes du dashboard, calculées sur le parc et les licences réels. */
export function construireStatsDashboard(
  equipements: Equipement[],
  licences: Licence[],
): MetricsCardData[] {
  return [
    {
      id: "laptops",
      label: "Ordinateurs portables",
      value: compterParType(equipements, "Ordinateur portable"),
      icon: IconDeviceLaptop,
      variant: "teal",
      trend: 8,
    },
    {
      id: "desktops",
      label: "Postes fixes",
      value: compterParType(equipements, "Poste fixe"),
      icon: IconDeviceDesktop,
      variant: "indigo",
      trend: 2,
    },
    {
      id: "licences",
      label: "Licences actives",
      value: licences.filter((l) => getLicenceStatut(l) !== "Expirée").length,
      icon: IconLicense,
      variant: "default",
      trend: 12,
    },
    {
      id: "assigned",
      label: "Équipements affectés",
      value: equipements.filter((e) => e.affecteA !== null).length,
      icon: IconCircleCheck,
      variant: "olive",
      trend: 6,
    },
    {
      id: "maintenance",
      label: "En panne / SAV",
      value: compterParStatut(equipements, "En panne"),
      icon: IconTool,
      variant: "red",
      trend: -3,
    },
  ];
}