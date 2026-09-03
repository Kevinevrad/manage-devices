import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";
import type { Equipement } from "@/data/equipements";
import { useSupprimerEquipement } from "@/hooks/api";

interface EquipementsRowActionsProps {
  /** Équipement de la ligne. */
  equipement: Equipement;
  /** Ouvre le panneau d'édition (géré par la page). */
  onModifier: (equipement: Equipement) => void;
}

/** Menu d'actions d'une ligne équipement. */
export function EquipementsRowActions({
  equipement,
  onModifier,
}: EquipementsRowActionsProps) {
  const { mutate, isPending } = useSupprimerEquipement();

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
        <DropdownMenuItem onClick={() => onModifier(equipement)}>
          <IconPencil />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() => mutate(equipement.id)}
        >
          <IconTrash />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
