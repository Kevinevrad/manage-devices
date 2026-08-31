import { IconDownload, IconLicense, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { LicencesTable } from "@/components/tables";
import { licences, licencesStats } from "@/data/licences";

export const Route = createFileRoute("/_layout/licences")({
  component: () => {
    return (
      <div className="flex flex-col gap-6">
        {/* En-tête de page */}
        <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <IconLicense className="size-4" />
              Parc matériel
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Licences
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Gérez les abonnements et licences perpétuelles : sièges occupés,
              coûts et échéances de renouvellement.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload size={16} />
              Exporter
            </Button>
            <Button>
              <IconPlus size={16} />
              Ajouter une licence
            </Button>
          </div>
        </section>

        <MetricsSection
          stats={licencesStats}
          title="Couverture logicielle"
          description="Suivi des abonnements, des sièges occupés et des échéances."
        />

        <LicencesTable data={licences} />
      </div>
    );
  },
});
