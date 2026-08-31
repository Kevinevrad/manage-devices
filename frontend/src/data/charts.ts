import type { ChartConfig } from "@/components";

/**
 * Données de démonstration pour la section graphiques du dashboard.
 * À remplacer plus tard par les données de l'API backend.
 */

export const affectationsTrend = [
  { mois: "janv.", affectations: 8 },
  { mois: "févr.", affectations: 14 },
  { mois: "mars", affectations: 11 },
  { mois: "avr.", affectations: 19 },
  { mois: "mai", affectations: 16 },
  { mois: "juin", affectations: 24 },
];

export const affectationsChartConfig = {
  affectations: {
    label: "Affectations",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const equipementsParStatut = [
  { statut: "En service", total: 45, fill: "var(--chart-1)" },
  { statut: "En stock", total: 28, fill: "var(--chart-2)" },
  { statut: "En panne", total: 5, fill: "var(--chart-4)" },
  { statut: "Rebut", total: 1, fill: "var(--chart-5)" },
];

export const statutChartConfig = {
  total: { label: "Équipements" },
  "En service": { label: "En service", color: "var(--chart-1)" },
  "En stock": { label: "En stock", color: "var(--chart-2)" },
  "En panne": { label: "En panne", color: "var(--chart-4)" },
  Rebut: { label: "Rebut", color: "var(--chart-5)" },
} satisfies ChartConfig;