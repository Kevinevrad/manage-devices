import { useMemo } from "react";
import { IconUsers } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { ChargementDonnees, ErreurDonnees } from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { UsersTable } from "@/components/tables";
import { useUtilisateurs } from "@/hooks/api";
import { construireUsersStats } from "@/lib/users-stats";

export const Route = createFileRoute("/_layout/users")({
  component: UsersPage,
});

function UsersPage() {
  const {
    data: utilisateurs,
    isPending,
    isError,
    error,
    refetch,
  } = useUtilisateurs();

  const stats = useMemo(
    () => (utilisateurs ? construireUsersStats(utilisateurs) : []),
    [utilisateurs],
  );

  if (isError) {
    return (
      <ErreurDonnees message={error.message} onReessayer={() => void refetch()} />
    );
  }
  if (isPending || !utilisateurs) {
    return <ChargementDonnees />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de page */}
      <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <IconUsers className="size-4" />
            Organisation
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Utilisateurs
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Gérez l'annuaire : services, rôles et matériel rattaché à chacun.
          </p>
        </div>
      </section>

      <MetricsSection
        stats={stats}
        title="Vue d'ensemble de l'annuaire"
        description="Utilisateurs, services, rôles et équipements rattachés."
      />

      <UsersTable data={utilisateurs} />
    </div>
  );
}