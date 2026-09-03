import { useMemo, useState } from "react";
import { IconDeviceDesktop, IconDownload, IconPlus } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  Button,
  ChargementDonnees,
  ErreurDonnees,
  FormulaireEquipement,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components";
import { MetricsSection } from "@/components/sections/metrics";
import { EquipementsTable } from "@/components/tables";
import { useEquipements } from "@/hooks/api";
import { construireEquipementsStats } from "@/lib/stats";

export const Route = createFileRoute("/_layout/equipements")({
  /** Synchronise la catégorie du sous-menu avec l'URL (?categorie=…) */
  validateSearch: (search: Record<string, unknown>): { categorie?: string } => ({
    categorie:
      typeof search.categorie === "string" ? search.categorie : undefined,
  }),
  component: EquipementsPage,
});

function EquipementsPage() {
  const { categorie } = Route.useSearch();
  const navigate = useNavigate();
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const {
    data: equipements,
    isPending,
    isError,
    error,
    refetch,
  } = useEquipements();

  /** Catégories (types) distinctes du parc, dans l'ordre d'apparition. */
  const categories = useMemo(
    () => [...new Set((equipements ?? []).map((e) => e.type))],
    [equipements],
  );
  const stats = useMemo(
    () => (equipements ? construireEquipementsStats(equipements) : []),
    [equipements],
  );

  if (isError) {
    return (
      <ErreurDonnees
        message={error.message}
        onReessayer={() => void refetch()}
      />
    );
  }
  if (isPending || !equipements) {
    return <ChargementDonnees />;
  }

  const categorieActive =
    categorie && categories.includes(categorie) ? categorie : "tous";
  const compterParCategorie = (valeur: string): number =>
    equipements.filter((equipement) => equipement.type === valeur).length;

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de page */}
      <section className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-3 duration-500 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <IconDeviceDesktop className="size-4" />
            Parc matériel
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Équipements
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Suivez l'ensemble des machines de votre parc : statuts,
            affectations, dates d'achat et valeur.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <IconDownload size={16} />
            Exporter
          </Button>
          <Button onClick={() => setFormulaireOuvert(true)}>
            <IconPlus size={16} />
            Ajouter un équipement
          </Button>
        </div>
      </section>

      <MetricsSection stats={stats} />

      {/* Sous-menu — équipements séparés par catégorie */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          value={categorieActive}
          onValueChange={(value) =>
            navigate({
              to: "/equipements",
              search: (prev) => ({
                ...prev,
                categorie: String(value) === "tous" ? undefined : String(value),
              }),
            })
          }
        >
          <TabsList className="w-max">
            <TabsTrigger value="tous" className="px-3">
              Tous
              <span className="text-xs text-muted-foreground tabular-nums">
                {equipements.length}
              </span>
            </TabsTrigger>
            {categories.map((categorieItem) => (
              <TabsTrigger
                key={categorieItem}
                value={categorieItem}
                className="px-3"
              >
                {categorieItem}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {compterParCategorie(categorieItem)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <EquipementsTable data={equipements} categorie={categorieActive} />

      <FormulaireEquipement
        ouvert={formulaireOuvert}
        onFermer={() => setFormulaireOuvert(false)}
      />
    </div>
  );
}

