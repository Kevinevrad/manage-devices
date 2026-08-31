import { IconDotsVertical } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";

/** Menu d'actions d'une ligne équipement. */
export function EquipementsRowActions({ nom }: { nom: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
        >
          <IconDotsVertical />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem>Voir la fiche</DropdownMenuItem>
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem>Dupliquer</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => toast.error(`Suppression de « ${nom} » à confirmer`)}
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
