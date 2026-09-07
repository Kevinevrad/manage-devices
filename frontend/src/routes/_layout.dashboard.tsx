import { useMemo } from "react";
import { IconDownload, IconPlus, IconSparkles } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { Button, ChargementDonnees, ErreurDonnees } from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { ChartsSection } from "@/components/sections/charts";
import { useAuth } from "@/hooks/auth";
import { useAffectations, useEquipements, useLicences } from "@/hooks/api";
import {
  construireEquipementsParStatut,
  construireTendanceAffectations,
} from "@/lib/graphiques";
import { construireStatsDashboard } from "@/lib/stats";

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const Route = createFileRoute("/_layout/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { utilisateur } = useAuth();
  const {
    data: equipements,
    isPending: chargeEquipements,
    isError: echecEquipements,
    error: erreurEquipements,
    refetch: rechargerEquipements,
  } = useEquipements();
  const {
    data: licences,
    isPending: chargeLicences,
    isError: echecLicences,
    error: erreurLicences,
    refetch: rechargerLicences,
  } = useLicences();
  const { data: affectations } = useAffectations();

  const stats = useMemo(
    () =>
      equipements && licences
        ? construireStatsDashboard(equipements, licences)
        : [],
    [equipements, licences],
  );

  // Graphiques alimentés par les données réelles (affectations optionnelles :
  // la tendance affiche des zéros tant qu'elles ne sont pas chargées)
  const repartitionStatut = useMemo(
    () => construireEquipementsParStatut(equipements ?? []),
    [equipements],
  );
  const tendance = useMemo(
    () => construireTendanceAffectations(affectations ?? []),
    [affectations],
  );

  const erreur = echecEquipements
    ? erreurEquipements
    : echecLicences
      ? erreurLicences
      : null;
  const chargement = chargeEquipements || chargeLicences;
  const reessayer = () => {
    void rechargerEquipements();
    void rechargerLicences();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero — en-tête de bienvenue */}
      <section className="relative animate-in fade-in slide-in-from-bottom-3 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#00607c] to-[#003546] p-8 text-white duration-500 md:p-10">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 size-80 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <IconSparkles size={14} />
              Gestion de parc informatique
            </span>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Ravis de vous revoir, {utilisateur?.nomComplet ?? "…"} !
            </h1>
            <p className="text-sm text-white/80 md:text-base">
              Gérez l'ensemble de votre parc informatique sans prise de tête.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="text-xs text-white/60 capitalize">{today}</p>
            <div className="flex gap-2">
              <Button className="bg-white text-primary hover:bg-white/90">
                <IconPlus size={16} />
                Ajouter un équipement
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white dark:bg-transparent dark:hover:bg-white/10 dark:hover:text-white"
              >
                <IconDownload size={16} />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {erreur ? (
        <ErreurDonnees message={erreur.message} onReessayer={reessayer} />
      ) : chargement || stats.length === 0 ? (
        <ChargementDonnees avecTable={false} />
      ) : (
        <>
          <MetricsSection stats={stats} />
          <ChartsSection
            equipementsParStatut={repartitionStatut}
            tendanceAffectations={tendance}
          />
        </>
      )}
    </div>
  );
}
