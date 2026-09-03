import { IconArrowBackUp, IconDotsVertical, IconHistory } from "@tabler/icons-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";
import { useCloturerAffectation } from "@/hooks/api";

interface AffectationsRowActionsProps {
  /** Identifiant de l'affectation. */
  id: number;
  /** Date de retour — null tant que l'affectation est ouverte. */
  dateRetour: string | null;
}

/** Menu d'actions d'une ligne affectation. */
export function AffectationsRowActions({
  id,
  dateRetour,
}: AffectationsRowActionsProps) {
  const { mutate, isPending } = useCloturerAffectation();

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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <IconArrowBackUp />
          Planifier un retour
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconHistory />
          Voir l'historique
        </DropdownMenuItem>
        {dateRetour === null && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onClick={() => mutate(id)}
            >
              Clôturer l'affectation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
