import { useMemo, useState } from "react";
import {
  IconClipboardList,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { exportarCSV } from "@/lib/export";

import {
  Button,
  ChargementDonnees,
  ErreurDonnees,
  FormulaireAffectation,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { AffectationsTable } from "@/components/tables";
import { useAffectations, useEquipements } from "@/hooks/api";
import { construireAffectationsStats } from "@/lib/stats";

export const Route = createFileRoute("/_layout/affectations")({
  /** Synchronise le service du sous-menu avec l'URL (?service=…) */
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  component: AffectationsPage,
});

function AffectationsPage() {
  const { service } = Route.useSearch();
  const navigate = useNavigate();
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  const exporter = () => {
    void exportarCSV("/affectations/export", "affectations.csv").catch(() =>
      toast.error("Export impossible."),
    );
  };
  const {
    data: affectations,
    isPending,
    isError,
    error,
    refetch,
  } = useAffectations();
  const { data: equipements } = useEquipements();

  /** Services (départements) distincts, dans l'ordre d'apparition. */
  const services = useMemo(
    () => [...new Set((affectations ?? []).map((a) => a.service))],
    [affectations],
  );
  const stats = useMemo(
    () =>
      affectations && equipements
        ? construireAffectationsStats(affectations, equipements)
        : [],
    [affectations, equipements],
  );

  if (isError) {
    return (
      <ErreurDonnees message={error.message} onReessayer={() => void refetch()} />
    );
  }
  if (isPending || !affectations || !equipements) {
    return <ChargementDonnees />;
  }

  const serviceActif = service && services.includes(service) ? service : "tous";
  const compterParService = (valeur: string): number =>
    affectations.filter((affectation) => affectation.service === valeur).length;

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de page */}
      <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <IconClipboardList className="size-4" />
            Parc matériel
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Affectations
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Suivez qui détient quel équipement : remises en main propre,
            retours planifiés et historique des restitutions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exporter}>
            <IconDownload size={16} />
            Exporter
          </Button>
          <Button onClick={() => setFormulaireOuvert(true)}>
            <IconPlus size={16} />
            Nouvelle affectation
          </Button>
        </div>
      </section>

      <MetricsSection
        stats={stats}
        title="Affectation du matériel"
        description="Répartition des équipements entre les utilisateurs et les services."
      />

      {/* Sous-menu — affectations séparées par service */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          value={serviceActif}
          onValueChange={(value) =>
            navigate({
              to: "/affectations",
              search: (prev) => ({
                ...prev,
                service: String(value) === "tous" ? undefined : String(value),
              }),
            })
          }
        >
          <TabsList className="w-max">
            <TabsTrigger value="tous" className="px-3">
              Tous
              <span className="text-xs text-muted-foreground tabular-nums">
                {affectations.length}
              </span>
            </TabsTrigger>
            {services.map((serviceItem) => (
              <TabsTrigger
                key={serviceItem}
                value={serviceItem}
                className="px-3"
              >
                {serviceItem}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {compterParService(serviceItem)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <AffectationsTable data={affectations} service={serviceActif} />

      <FormulaireAffectation
        ouvert={formulaireOuvert}
        onFermer={() => setFormulaireOuvert(false)}
      />
    </div>
  );
}
