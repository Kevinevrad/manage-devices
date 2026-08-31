import { cn } from "@/lib/utils";
import type { MetricsSectionProps } from "./metrics-section.types";
import { MetricsCard } from "@/components";

export const MetricsSection = ({ stats, className }: MetricsSectionProps) => {
  return (
    <section className={cn("", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Vue d'ensemble du parc
          </h2>
          <p className="text-sm text-muted-foreground">
            Répartition actuelle des équipements et des licences.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <MetricsCard key={stat.id} index={index} {...stat} />
        ))}
      </div>
    </section>
  );
};
