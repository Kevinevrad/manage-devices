import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

import { Button, Card, Skeleton } from "@/components";

import type { ErreurDonneesProps } from "./query-states.types";

interface ChargementDonneesProps {
  /** Inclut aussi le squelette du tableau de données (défaut : oui). */
  avecTable?: boolean;
}

/** Squelette affiché pendant le chargement des données de l'API. */
export function ChargementDonnees({
  avecTable = true,
}: ChargementDonneesProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      {avecTable && <Skeleton className="h-96" />}
    </div>
  );
}

/** Carte d'erreur avec relance, affichée si l'API est injoignable ou en échec. */
export function ErreurDonnees({ message, onReessayer }: ErreurDonneesProps) {
  return (
    <Card className="flex flex-col items-center gap-4 p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <IconAlertTriangle size={24} stroke={1.75} />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Impossible de charger les données
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {message ??
            "Une erreur est survenue lors de l'appel à l'API. Vérifiez que le backend est démarré."}
        </p>
      </div>
      {onReessayer && (
        <Button variant="outline" onClick={onReessayer}>
          <IconRefresh size={16} />
          Réessayer
        </Button>
      )}
    </Card>
  );
}