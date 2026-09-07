import { type ColumnDef } from "@tanstack/react-table";
import { IconDeviceDesktop, IconHistory } from "@tabler/icons-react";

import { Avatar, AvatarFallback, Badge } from "@/components";
import type { UtilisateurApi } from "@/types/api";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Couleurs des badges de rôle. */
const roleStyles: Record<string, string> = {
  admin: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  technicien: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  user: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export const userColumns: ColumnDef<UtilisateurApi>[] = [
  {
    accessorKey: "nomComplet",
    header: "Utilisateur",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-0.5">
        <Avatar size="sm" className="rounded-lg">
          <AvatarFallback className="text-[10px] font-semibold">
            {initials(row.original.nomComplet)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {row.original.nomComplet}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-sm">{row.original.service}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.structure}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => (
      <Badge
        className={cn("border-transparent", roleStyles[row.original.role] ?? roleStyles.user)}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "_count",
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconDeviceDesktop className="size-4" />
        Équipements
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-medium tabular-nums">
        <IconDeviceDesktop className="size-4 text-muted-foreground" />
        {row.original._count.equipements}
      </div>
    ),
  },
  {
    accessorKey: "historiquesAffectations",
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconHistory className="size-4" />
        Affectations
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-medium tabular-nums">
        <IconHistory className="size-4 text-muted-foreground" />
        {row.original._count.historiquesAffectations}
      </div>
    ),
  },
];