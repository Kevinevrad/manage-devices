import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components";
import { cn } from "@/lib/utils";
import { affectationsChartConfig, statutChartConfig } from "@/data/charts";
import type { ChartsSectionProps } from "./charts-section.types";

export const ChartsSection = ({
  className,
  equipementsParStatut,
  tendanceAffectations,
}: ChartsSectionProps) => {
  const totalEquipements = equipementsParStatut.reduce(
    (acc, statut) => acc + statut.total,
    0,
  );
  return (
    <section className={cn("grid gap-4 lg:grid-cols-5", className)}>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Affectations mensuelles</CardTitle>
          <CardDescription>
            Équipements affectés sur les 6 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={affectationsChartConfig}
            className="aspect-auto h-56 w-full"
          >
            <AreaChart
              data={tendanceAffectations}
              margin={{ left: 4, right: 12 }}
            >
              <defs>
                <linearGradient
                  id="fillAffectations"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-affectations)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-affectations)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="mois"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis width={28} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="affectations"
                type="monotone"
                fill="url(#fillAffectations)"
                stroke="var(--color-affectations)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Répartition du parc</CardTitle>
          <CardDescription>Équipements par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <ChartContainer
              config={statutChartConfig}
              className="aspect-auto h-48 w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={equipementsParStatut}
                  dataKey="total"
                  nameKey="statut"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={3}
                  cornerRadius={6}
                  strokeWidth={0}
                >
                  {equipementsParStatut.map((entry) => (
                    <Cell key={entry.statut} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-bold">
                {totalEquipements}
              </span>
              <span className="text-xs text-muted-foreground">équipements</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {equipementsParStatut.map((entry) => (
              <div
                key={entry.statut}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="size-2 rounded-xs"
                  style={{ backgroundColor: entry.fill }}
                />
                {entry.statut}
                <span className="font-semibold text-foreground">
                  {entry.total}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
