import { useMemo } from "react";
import { IconChartBar, IconDownload } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { ChargementDonnees, ErreurDonnees } from "@/components";
import { useEquipements, useLicences } from "@/hooks/api";
import { calculerSyntheseInventaire } from "@/lib/inventaire";
import { formatEuros } from "@/lib/format";
import { exportarCSV } from "@/lib/export";

export const Route = createFileRoute("/_layout/rapports/inventaire")({
  component: InventairePage,
});

function InventairePage() {
  const {
    data: equipements,
    isPending,
    isError,
    error,
    refetch,
  } = useEquipements();
  const { data: licences } = useLicences();

  const synthese = useMemo(
    () =>
      equipements && licences
        ? calculerSyntheseInventaire(equipements, licences)
        : null,
    [equipements, licences],
  );

  if (isError) {
    return (
      <ErreurDonnees message={error.message} onReessayer={() => void refetch()} />
    );
  }
  if (isPending || !synthese) {
    return <ChargementDonnees avecTable={false} />;
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
            Inventaire
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Synthèse globale du parc matériel et de la couverture logicielle.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            void exportarCSV("/equipements/export", "inventaire.csv").catch(() =>
              toast.error("Export impossible."),
            )
          }
        >
          <IconDownload size={16} />
          Exporter l'inventaire
        </Button>
      </section>

      {/* Synthèse du parc */}
      <Card>
        <CardHeader>
          <CardTitle>Parc matériel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatTuile label="Total équipements" valeur={synthese.totalEquipements} />
            <StatTuile label="En service" valeur={synthese.enService} />
            <StatTuile label="En stock" valeur={synthese.enStock} />
            <StatTuile label="En panne / SAV" valeur={synthese.enPanne} />
            <StatTuile label="Rebut" valeur={synthese.rebut} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Valeur totale du parc :{" "}
            <span className="font-medium text-foreground">
              {formatEuros(synthese.valeurParc)}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Synthèse des licences */}
      <Card>
        <CardHeader>
          <CardTitle>Couverture logicielle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatTuile label="Licences" valeur={synthese.totalLicences} />
            <StatTuile label="Actives" valeur={synthese.licencesActives} />
            <StatTuile
              label="Expirent sous 30 j"
              valeur={synthese.licencesExpirentBientot}
            />
            <StatTuile label="Expirées" valeur={synthese.licencesExpirees} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Coût annuel des abonnements :{" "}
            <span className="font-medium text-foreground">
              {formatEuros(synthese.coutAnnuelTotal)}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatTuileProps {
  label: string;
  valeur: number;
}

function StatTuile({ label, valeur }: StatTuileProps) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-4">
      <span className="text-2xl font-bold tabular-nums">{valeur}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}