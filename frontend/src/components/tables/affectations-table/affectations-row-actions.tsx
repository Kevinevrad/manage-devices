import {
  IconArrowBackUp,
  IconCalendarPlus,
  IconDotsVertical,
  IconHistory,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";

/** Menu d'actions d'une ligne affectation. */
export function AffectationsRowActions({ equipement }: { equipement: string }) {
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
          <IconCalendarPlus />
          Prolonger l'affectation
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconHistory />
          Voir l'historique
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            toast.info(`Restitution de « ${equipement} » à confirmer`)
          }
        >
          Clôturer l'affectation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
