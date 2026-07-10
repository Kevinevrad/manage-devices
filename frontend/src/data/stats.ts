import type { MetricsCardData } from "@/components";
import {
  IconBox,
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconLicense,
} from "@tabler/icons-react";

export const stats: MetricsCardData[] = [
  {
    id: "laptops",
    label: "Total Laptops",
    value: 47,
    icon: IconDeviceLaptop,
    variant: "teal",
  },
  {
    id: "licences",
    label: "Total Licences",
    value: 10,
    icon: IconLicense,
    variant: "default",
  },
  {
    id: "desktops",
    label: "Total Desktops",
    value: 3,
    icon: IconDeviceDesktop,
    variant: "indigo",
  },

  {
    id: "warehouse",
    label: "In warehouse",
    value: 32,
    icon: IconBox,
    variant: "default",
  },
  {
    id: "sent",
    label: "Sent",
    value: 2,
    icon: IconCircleCheck,
    variant: "default",
  },
];
