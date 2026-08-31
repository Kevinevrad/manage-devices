import {
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDevices,
  IconPictureInPicture,
  IconPrinter,
  IconUsb,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, Badge } from "@/components";
import type { Affectation, AffectationStatut } from "@/data/affectations";
import { getAffectationStatut, joursAvantRetour } from "@/data/affectations";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

import { AffectationsRowActions } from "./affectations-row-actions";
import { SortButton } from "../sort-button";

/** Icône associée au type d'équipement affecté. */
const typeIcons: Record<string, TablerIcon> = {
  "Ordinateur portable": IconDeviceLaptop,
  "Poste fixe": IconDeviceDesktop,
  Écran: IconPictureInPicture,
  Imprimante: IconPrinter,
  Smartphone: IconDeviceMobile,
  "Station d'accueil": IconUsb,
};

/** Couleurs des badges de statut d'affectation. */
const statutStyles: Record<AffectationStatut, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Retour planifié": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Terminée: "bg-muted text-muted-foreground",
};

export const affectationColumns: ColumnDef<Affectation>[] = [
  {
    accessorKey: "equipement",
    header: ({ column }) => <SortButton column={column}>Équipement</SortButton>,
    cell: ({ row }) => {
      const TypeIcon =
        typeIcons[row.original.typeEquipement] ?? IconDevices;
      return (
        <div className="flex items-center gap-3 py-0.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <TypeIcon size={18} stroke={1.75} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.original.equipement}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.numSerie}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "utilisateur",
    header: ({ column }) => <SortButton column={column}>Utilisateur</SortButton>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="text-[10px] font-semibold">
            {initials(row.original.utilisateur)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{row.original.utilisateur}</span>
      </div>
    ),
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-2 text-muted-foreground">
        {row.original.service}
      </Badge>
    ),
  },
  {
    accessorKey: "dateAffectation",
    header: ({ column }) => <SortButton column={column}>Affecté le</SortButton>,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.dateAffectation)}
      </span>
    ),
  },
  {
    accessorKey: "dateRetour",
    header: ({ column }) => <SortButton column={column}>Retour</SortButton>,
    cell: ({ row }) => {
      const affectation = row.original;
      if (!affectation.dateRetour) {
        return (
          <span className="text-sm text-muted-foreground">Sans échéance</span>
        );
      }
      const jours = joursAvantRetour(affectation);
      return (
        <div className="space-y-0.5">
          <p className="text-sm">{formatDate(affectation.dateRetour)}</p>
          {jours <= 30 && (
            <p
              className={cn(
                "text-xs font-medium",
                jours < 0
                  ? "text-muted-foreground"
                  : "text-amber-600 dark:text-amber-400",
              )}
            >
              {jours < 0
                ? `Restitué depuis ${Math.abs(jours)} j`
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
      const statut = getAffectationStatut(row.original);
      return (
        <Badge className={cn("border-transparent", statutStyles[statut])}>
          <span className="size-1.5 rounded-full bg-current" />
          {statut}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <AffectationsRowActions equipement={row.original.equipement} />
    ),
  },
];
