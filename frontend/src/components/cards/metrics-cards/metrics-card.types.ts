import type { Icon as TablerIcon } from "@tabler/icons-react";

/**
 * Palette disponible pour une carte de stat.
 * Chaque variant correspond à une couleur de fond pleine.
 */
export type MetricsCardVariant =
  "teal" | "red" | "indigo" | "pink" | "olive" | "default";

export interface MetricsCardsProps {
  /** Identifiant unique (utilisé comme key) */
  id: string;
  /** Libellé affiché en haut de la carte (ex: "Total orders") */
  label: string;
  /** Valeur principale affichée en gros (ex: 47) */
  value: number | string;
  /** Icône Tabler (ex: IconPackage) */
  icon: TablerIcon;
  /** Couleur de fond de la carte */
  variant: MetricsCardVariant;
}

// export interface MetricsCardsProps {
//   stats: MetricsCardData;
// }
