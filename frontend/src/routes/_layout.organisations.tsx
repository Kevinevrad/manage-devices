import { useMemo, useState } from "react";
import { IconBuilding, IconDownload, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components";
import { ChargementDonnees, ErreurDonnees } from "@/components";
import {
  useOrganisations,
  useSupprimerOrganisation,
} from "@/hooks/api";
import { useAuth } from "@/hooks/auth";
import { exportarCSV } from "@/lib/export";
import { FormulaireOrganisation } from "@/components/forms/organisations";

export const Route = createFileRoute("/_layout/organisations")({
  component: OrganisationsPage,
});

function OrganisationsPage() {
  const { data: organisations, isPending, isError, error, refetch } = useOrganisations();
  const { utilisateur } = useAuth();
  const [recherche, setRecherche] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  const estAdmin = utilisateur?.role === "admin";

  const organisationsFiltrees = useMemo(() => {
    const query = recherche.trim().toLowerCase();
    if (!query) return organisations ?? [];
    return (organisations ?? []).filter((org) => org.nom.toLowerCase().includes(query));
  }, [organisations, recherche]);

  if (isError) {
    return <ErreurDonnees message={error.message} onReessayer={() => void refetch()} />;
  }
  if (isPending || !organisations) {
    return <ChargementDonnees />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <IconBuilding className="size-4" />
            Administration
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Organisations
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Structures du parc : chaque organisation regroupe ses utilisateurs, équipements et licences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void exportarCSV("/equipements/export", "organisations-equipements.csv").catch(() =>
              toast.error("Export impossible."),
            )}
          >
            <IconDownload size={16} />
            Exporter
          </Button>
          {estAdmin && (
            <Button onClick={() => setFormulaireOuvert(true)}>
              <IconPlus size={16} />
              Créer une organisation
            </Button>
          )}
        </div>
      </section>

      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une organisation..."
          className="pl-8"
        />
      </div>

      {/* Liste des organisations */}
      <Card>
        <CardHeader>
          <CardTitle>
            {organisationsFiltrees.length} organisation{organisationsFiltrees.length > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {organisationsFiltrees.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune organisation ne correspond à votre recherche.
            </p>
          ) : (
            <div className="divide-y">
              {organisationsFiltrees.map((org) => (
                <LigneOrganisation
                  key={org.id}
                  organisation={org}
                  estAdmin={estAdmin}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire de création */}
      {formulaireOuvert && (
        <FormulaireOrganisation onFermer={() => setFormulaireOuvert(false)} />
      )}
    </div>
  );
}

interface LigneOrganisationProps {
  organisation: {
    id: number;
    nom: string;
    utilisateurs: number;
    equipements: number;
    logiciels: number;
  };
  estAdmin: boolean;
}

function LigneOrganisation({ organisation, estAdmin }: LigneOrganisationProps) {
  const supprimerMutation = useSupprimerOrganisation();

  const handleSupprimer = () => {
    if (confirm(`Supprimer l'organisation « ${organisation.nom} » ?`)) {
      supprimerMutation.mutate(organisation.id);
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <IconBuilding className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{organisation.nom}</p>
          <p className="text-sm text-muted-foreground">
            {organisation.utilisateurs} utilisateurs · {organisation.equipements} équipements · {organisation.logiciels} licences
          </p>
        </div>
      </div>
      {estAdmin && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSupprimer}
          disabled={supprimerMutation.isPending}
        >
          Supprimer
        </Button>
      )}
    </div>
  );
}