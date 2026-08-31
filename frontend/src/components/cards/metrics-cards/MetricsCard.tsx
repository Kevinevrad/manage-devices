import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/others/animated-counter/AnimatedCounter";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import type {
  MetricsCardsProps,
  MetricsCardVariant,
} from "./metrics-card.types";

/**
 * Styles par variant, calqués sur la charte : fond teinté doux,
 * badge d'icône coloré et texte foncé pour une meilleure lisibilité.
 */
const variantStyles: Record<MetricsCardVariant, { card: string; badge: string }> = {
  teal: {
    card: "bg-teal-50 text-teal-950 ring-teal-600/15 dark:bg-teal-500/10 dark:text-teal-50 dark:ring-teal-400/20",
    badge: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  red: {
    card: "bg-rose-50 text-rose-950 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-50 dark:ring-rose-400/20",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  indigo: {
    card: "bg-indigo-50 text-indigo-950 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-50 dark:ring-indigo-400/20",
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    card: "bg-pink-50 text-pink-950 ring-pink-600/15 dark:bg-pink-500/10 dark:text-pink-50 dark:ring-pink-400/20",
    badge: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  },
  olive: {
    card: "bg-lime-50 text-lime-950 ring-lime-600/15 dark:bg-lime-500/10 dark:text-lime-50 dark:ring-lime-400/20",
    badge: "bg-lime-500/15 text-lime-600 dark:text-lime-400",
  },
  default: {
    card: "bg-card text-card-foreground",
    badge: "bg-primary/10 text-primary",
  },
};

export function MetricsCard(stats: MetricsCardsProps) {
  const Icon = stats.icon;
  const variantStyle = variantStyles[stats.variant];
  const trend = stats.trend;
  const trendIsPositive = trend !== undefined && trend >= 0;

  return (
    <Card
      className={cn(
        "group relative animate-in fade-in slide-in-from-bottom-3 fill-mode-both overflow-hidden rounded-2xl py-0 shadow-none ring-1 duration-500 transition-[translate,box-shadow] hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5",
        variantStyle.card,
      )}
      style={
        stats.index !== undefined
          ? { animationDelay: `${stats.index * 80}ms` }
          : undefined
      }
    >
      <Icon
        className="pointer-events-none absolute -right-5 -bottom-5 size-24 opacity-[0.06] transition-transform duration-500 group-hover:scale-110"
        stroke={1.25}
      />
      <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              variantStyle.badge,
            )}
          >
            <Icon size={20} stroke={1.75} />
          </div>
          {trend !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trendIsPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
              )}
            >
              {trendIsPositive ? (
                <IconTrendingUp size={14} />
              ) : (
                <IconTrendingDown size={14} />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold leading-none tracking-tight">
            {typeof stats.value === "number" ? (
              <AnimatedCounter value={stats.value} />
            ) : (
              stats.value
            )}
          </div>
          <p className="text-sm font-medium opacity-70">{stats.label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
