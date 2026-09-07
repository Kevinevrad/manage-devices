import { useMemo } from "react";
import { IconChartBar } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { ChargementDonnees, ErreurDonnees } from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { LicencesTable } from "@/components/tables";
import { useLicences } from "@/hooks/api";
import { construireLicencesStats } from "@/lib/stats";

export const Route = createFileRoute("/_layout/rapports/licences-expirantes")({
  component: LicencesExpirantesPage,
});

function LicencesExpirantesPage() {
  // Le backend filtre les licences expirant dans les 30 prochains jours
  const {
    data: licences,
    isPending,
    isError,
    error,
    refetch,
  } = useLicences({ expireSous: 30 });

  const stats = useMemo(
    () => (licences ? construireLicencesStats(licences) : []),
    [licences],
  );

  if (isError) {
    return (
      <ErreurDonnees message={error.message} onReessayer={() => void refetch()} />
    );
  }
  if (isPending || !licences) {
    return <ChargementDonnees />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <IconChartBar className="size-4" />
            Rapports
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Licences expirantes
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Abonnements arrivant à échéance sous 30 jours, pour anticiper les
            renouvellements.
          </p>
        </div>
      </section>

      <MetricsSection
        stats={stats}
        title="Échéances proches"
        description="Licences qui arrivent à expiration sous 30 jours."
      />

      <LicencesTable data={licences} />
    </div>
  );
}