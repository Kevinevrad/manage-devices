import { IconSettings2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "@/hooks/auth";

export const Route = createFileRoute("/_layout/parametres")({
  component: ParametresPage,
});

function ParametresPage() {
  const { utilisateur } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <IconSettings2 className="size-4" />
            Paramètres
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Paramètres
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Informations du compte et de l'organisation.
          </p>
        </div>
      </section>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle>Mon compte</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <Ligne label="Nom" valeur={utilisateur?.nomComplet ?? "…"} />
            <Ligne label="E-mail" valeur={utilisateur?.email ?? "…"} />
            <Ligne label="Rôle" valeur={utilisateur?.role ?? "…"} />
            <Ligne label="Service" valeur={utilisateur?.service ?? "…"} />
            <Ligne label="Structure" valeur={utilisateur?.structure ?? "…"} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

interface LigneProps {
  label: string;
  valeur: string;
}

function Ligne({ label, valeur }: LigneProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{valeur}</dd>
    </div>
  );
}