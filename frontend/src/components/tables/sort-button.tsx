import * as React from "react";
import { IconArrowDown, IconArrowUp, IconSelector } from "@tabler/icons-react";
import type { Column } from "@tanstack/react-table";

import { Button } from "@/components";

interface SortButtonProps<TData> {
  column: Column<TData, unknown>;
  children: React.ReactNode;
}

/** En-tête de colonne triable, avec flèche d'état (partagé entre les tables). */
export function SortButton<TData>({
  column,
  children,
}: SortButtonProps<TData>) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2.5 h-8 gap-1"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {children}
      {sorted === "asc" ? (
        <IconArrowUp className="size-3.5" />
      ) : sorted === "desc" ? (
        <IconArrowDown className="size-3.5" />
      ) : (
        <IconSelector className="size-3.5 text-muted-foreground/60" />
      )}
    </Button>
  );
}
