import type { MetricsCardData } from "@/components";
import {
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconLicense,
  IconTool,
} from "@tabler/icons-react";

export const stats: MetricsCardData[] = [
  {
    id: "laptops",
    label: "Ordinateurs portables",
    value: 47,
    icon: IconDeviceLaptop,
    variant: "teal",
    trend: 8,
  },
  {
    id: "desktops",
    label: "Postes fixes",
    value: 32,
    icon: IconDeviceDesktop,
    variant: "indigo",
    trend: 2,
  },
  {
    id: "licences",
    label: "Licences actives",
    value: 120,
    icon: IconLicense,
    variant: "default",
    trend: 12,
  },
  {
    id: "assigned",
    label: "Équipements affectés",
    value: 45,
    icon: IconCircleCheck,
    variant: "olive",
    trend: 6,
  },
  {
    id: "maintenance",
    label: "En panne / SAV",
    value: 5,
    icon: IconTool,
    variant: "red",
    trend: -3,
  },
];
