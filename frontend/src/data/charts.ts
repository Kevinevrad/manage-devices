import type { ChartConfig } from "@/components";

/**
 * Configurations recharts du dashboard. Les données viennent de l'API —
 * construites dans lib/graphiques.ts à partir des équipements et
 * affectations réels.
 */

export const affectationsChartConfig = {
  affectations: {
    label: "Affectations",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const statutChartConfig = {
  total: { label: "Équipements" },
  "En service": { label: "En service", color: "var(--chart-1)" },
  "En stock": { label: "En stock", color: "var(--chart-2)" },
  "En panne": { label: "En panne", color: "var(--chart-4)" },
  Rebut: { label: "Rebut", color: "var(--chart-5)" },
} satisfies ChartConfig;