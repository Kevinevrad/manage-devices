import {
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
      url: "#",
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
          url: "#",
        },
        {
          title: "Licences",
          url: "#",
        },
        {
          title: "Affectations",
          url: "#",
        },
      ],
    },
    {
      title: "Utilisateurs",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Rapports",
      url: "#",
      icon: IconChartBar,
      items: [
        {
          title: "Inventaire",
          url: "#",
        },
        {
          title: "Licences expirantes",
          url: "#",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "#",
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
