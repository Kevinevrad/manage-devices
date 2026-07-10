import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type {
  MetricsCardsProps,
  MetricsCardVariant,
} from "./metrics-card.types";

/**
 * Couleurs de fond par variant, calquées sur la maquette fournie.
 * Ajuste librement les valeurs hex si ta charte diffère.
 */
const variantStyles: Record<MetricsCardVariant, string> = {
  teal: "bg-[#14B8A6]",
  red: "bg-[#E31C5F]",
  indigo: "bg-[#4C51BF]",
  pink: "bg-[#E17DB5]",
  olive: "bg-[#ABA430]",
  default: "bg-secondary border-2 border-primary text-dark",
};

export function MetricsCard(stats: MetricsCardsProps) {
  const Icon = stats.icon;

  return (
    <Card
      className={cn(
        "border-none shadow-sm rounded-xl py-0 text-white aspect-video bg-muted/50 border-2 h-full",
        `${variantStyles[stats.variant]}`,
      )}
    >
      <CardContent className="flex flex-col gap-3 h-full p-4 items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-medium opacity-95">
          <Icon size={18} stroke={1.75} />
          <span>{stats.label}</span>
        </div>
        <div className="text-5xl font-bold leading-none">{stats.value}</div>
      </CardContent>
    </Card>
  );
}
