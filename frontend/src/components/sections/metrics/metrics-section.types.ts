import type { MetricsCardsProps } from "@/components/cards";
export interface MetricsSectionProps {
  stats: MetricsCardsProps[];
  className?: string;
  /** Titre de la section (défaut : "Vue d'ensemble du parc") */
  title?: string;
  /** Description affichée sous le titre */
  description?: string;
}
