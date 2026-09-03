import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components";
import type { Licence, LicenceStatut } from "@/data/licences";
import { getLicenceStatut, joursAvantExpiration } from "@/data/licences";
import { formatDate, formatEuros } from "@/lib/format";
import { cn } from "@/lib/utils";

import { LicencesRowActions } from "./licences-row-actions";
import { SortButton } from "../sort-button";

/** Couleurs des badges de statut de licence. */
const statutStyles: Record<LicenceStatut, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Expire bientôt": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Expirée: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export const licenceColumns: ColumnDef<Licence>[] = [
  {
    accessorKey: "logiciel",
    header: ({ column }) => <SortButton column={column}>Logiciel</SortButton>,
    cell: ({ row }) => (
      <div className="py-0.5">
        <p className="text-sm font-medium">{row.original.logiciel}</p>
        <p className="text-xs text-muted-foreground">{row.original.editeur}</p>
      </div>
    ),
  },
  {
    accessorKey: "cle",
    header: "Clé / Contrat",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.cle}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant={row.original.type === "Abonnement" ? "outline" : "secondary"}
        className="px-2 text-muted-foreground"
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "siegesUtilises",
    header: ({ column }) => <SortButton column={column}>Sièges</SortButton>,
    cell: ({ row }) => {
      const { siegesUtilises, siegesTotal } = row.original;
      const pourcentage = Math.min(
        100,
        Math.round((siegesUtilises / siegesTotal) * 100),
      );
      const barreStyle =
        pourcentage >= 100
          ? "bg-rose-500"
          : pourcentage >= 80
            ? "bg-amber-500"
            : "bg-emerald-500";
      return (
        <div className="w-32 space-y-1.5 py-0.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", barreStyle)}
              style={{ width: `${pourcentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {siegesUtilises} / {siegesTotal} sièges
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "dateExpiration",
    header: ({ column }) => (
      <SortButton column={column}>Expiration</SortButton>
    ),
    cell: ({ row }) => {
      const licence = row.original;
      if (!licence.dateExpiration) {
        return (
          <span className="text-sm text-muted-foreground">Sans échéance</span>
        );
      }
      const jours = joursAvantExpiration(licence);
      return (
        <div className="space-y-0.5">
          <p className="text-sm">{formatDate(licence.dateExpiration)}</p>
          {jours <= 30 && (
            <p
              className={cn(
                "text-xs font-medium",
                jours < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            >
              {jours < 0
                ? `Expirée depuis ${Math.abs(jours)} j`
                : `Dans ${jours} j`}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = getLicenceStatut(row.original);
      return (
        <Badge className={cn("border-transparent", statutStyles[statut])}>
          <span className="size-1.5 rounded-full bg-current" />
          {statut}
        </Badge>
      );
    },
  },
  {
    accessorKey: "coutAnnuel",
    header: ({ column }) => (
      <div className="text-right">
        <SortButton column={column}>Coût</SortButton>
      </div>
    ),
    cell: ({ row }) =>
      row.original.coutAnnuel === null ? (
        <span className="text-sm text-muted-foreground">—</span>
      ) : (
        <div className="text-right">
          <p className="font-medium">{formatEuros(row.original.coutAnnuel)}</p>
          <p className="text-xs text-muted-foreground">par an</p>
        </div>
      ),
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <LicencesRowActions cle={row.original.cle} id={row.original.id} />
    ),
  },
];