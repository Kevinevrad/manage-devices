import { IconDeviceDesktop, IconUsers, IconUserShield } from "@tabler/icons-react";

import type { MetricsCardData } from "@/components";
import type { UtilisateurApi } from "@/types/api";

/** Cartes de la page « Utilisateurs » calculées sur les données réelles. */
export function construireUsersStats(
  utilisateurs: UtilisateurApi[],
): MetricsCardData[] {
  const equipes = utilisateurs.filter(
    (utilisateur) => utilisateur._count.equipements > 0,
  ).length;
  const admins = utilisateurs.filter(
    (utilisateur) => utilisateur.role === "admin",
  ).length;
  // Nombre de services distincts
  const services = new Set(
    utilisateurs.map((utilisateur) => utilisateur.service),
  ).size;

  return [
    {
      id: "total-utilisateurs",
      label: "Utilisateurs",
      value: utilisateurs.length,
      icon: IconUsers,
      variant: "default",
    },
    {
      id: "utilisateurs-equipes",
      label: "Équipés",
      value: equipes,
      icon: IconDeviceDesktop,
      variant: "teal",
    },
    {
      id: "services",
      label: "Services",
      value: services,
      icon: IconUsers,
      variant: "indigo",
    },
    {
      id: "admins",
      label: "Administrateurs",
      value: admins,
      icon: IconUserShield,
      variant: "pink",
    },
  ];
}