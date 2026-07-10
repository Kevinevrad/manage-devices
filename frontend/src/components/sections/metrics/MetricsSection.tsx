import { cn } from "@/lib/utils";
import type { MetricsSectionProps } from "./metrics-section.types";
import { MetricsCard } from "@/components";
import { Separator } from "@base-ui/react";

export const MetricsSection = ({ stats, className }: MetricsSectionProps) => {
  return (
    <>
      <div className="flex  items-center gap-10 my-5 font-semibold font-serif">
        <Separator className="w-full h-0.5 bg-amber-100 flex-1" />

        <h2 className="text-2xl tracking-wide uppercase">Bilan de l'armadat</h2>
        <Separator className="w-full h-0.5 bg-amber-100 flex-1" />
      </div>
      <div
        className={cn(
          "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5  h-full bg-teal-300   auto-rows-min   md:grid-cols-4",
          className,
        )}
      >
        {stats.map((el) => (
          <MetricsCard
            icon={el.icon}
            id={el.id}
            label={el.label}
            value={el.value}
            variant={el.variant}
          />
        ))}
      </div>
    </>
  );
};
