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
import type { Equipement, EquipementStatut } from "@/data/equipements";
import { formatDate, formatEuros, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

import { EquipementsRowActions } from "./equipements-row-actions";
import { SortButton } from "../sort-button";

/** Icône associée à chaque type d'équipement. */
const typeIcons: Record<string, TablerIcon> = {
  "Ordinateur portable": IconDeviceLaptop,
  "Poste fixe": IconDeviceDesktop,
  Écran: IconPictureInPicture,
  Imprimante: IconPrinter,
  Smartphone: IconDeviceMobile,
  "Station d'accueil": IconUsb,
};

/** Couleurs des badges de statut, calquées sur la charte des MetricsCard. */
const statutStyles: Record<EquipementStatut, string> = {
  "Non Affecté": "bg-muted text-muted-foreground",
  "En service": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "En stock": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "En panne": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  Rebut: "bg-muted text-muted-foreground",
};

export const equipementColumns: ColumnDef<Equipement>[] = [
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <SortButton column={column}>Équipement</SortButton>
    ),
    cell: ({ row }) => {
      const TypeIcon = typeIcons[row.original.type] ?? IconDevices;
      return (
        <div className="flex items-center gap-3 py-0.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <TypeIcon size={18} stroke={1.75} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.original.nom}
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-2 text-muted-foreground">
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "marque",
    header: "Marque",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.marque}
      </span>
    ),
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => (
      <Badge
        className={cn("border-transparent", statutStyles[row.original.statut])}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {row.original.statut}
      </Badge>
    ),
  },
  {
    accessorKey: "affecteA",
    header: "Affecté à",
    cell: ({ row }) =>
      row.original.affecteA ? (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback className="text-[10px] font-semibold">
              {initials(row.original.affecteA)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{row.original.affecteA}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Non affecté</span>
      ),
  },
  {
    accessorKey: "dateAchat",
    header: ({ column }) => (
      <SortButton column={column}>Date d'achat</SortButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.dateAchat)}
      </span>
    ),
  },
  {
    accessorKey: "prix",
    header: ({ column }) => (
      <div className="text-right">
        <SortButton column={column}>Prix</SortButton>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatEuros(row.original.prix)}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <EquipementsRowActions nom={row.original.nom} />,
  },
];