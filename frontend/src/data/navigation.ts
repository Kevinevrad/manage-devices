import {
  IconBuilding,
  IconChartBar,
  IconDeviceDesktop,
  IconLayoutDashboard,
  IconLifebuoy,
  IconSend,
  IconSettings2,
  IconUsers,
} from "@tabler/icons-react";

export const navs = {
  navMain: [
    {
      title: "Vue d'ensemble",
      url: "/dashboard",
      icon: IconLayoutDashboard,
      isActive: true,
    },
    {
      title: "Parc matériel",
      url: "#",
      icon: IconDeviceDesktop,
      items: [
        {
          title: "Équipements",
          url: "/equipements",
        },
        {
          title: "Licences",
          url: "/licences",
        },
        {
          title: "Affectations",
          url: "/affectations",
        },
      ],
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Organisations",
      url: "/organisations",
      icon: IconBuilding,
      /** Réservé aux administrateurs (filtré côté UI). */
      adminOnly: true,
    },
    {
      title: "Rapports",
      url: "#",
      icon: IconChartBar,
      items: [
        {
          title: "Inventaire",
          url: "/rapports/inventaire",
        },
        {
          title: "Licences expirantes",
          url: "/rapports/licences-expirantes",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "/parametres",
      icon: IconSettings2,
    },
  ],

  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: IconLifebuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: IconSend,
    },
  ],
};
