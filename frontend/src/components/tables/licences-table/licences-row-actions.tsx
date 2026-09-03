import { IconCopy, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";
import { useSupprimerLicence } from "@/hooks/api";

interface LicencesRowActionsProps {
  /** Clé de la licence (pour la copie presse-papiers). */
  cle: string;
  /** Identifiant de la licence. */
  id: number;
}

/** Menu d'actions d'une ligne licence. */
export function LicencesRowActions({ cle, id }: LicencesRowActionsProps) {
  const { mutate, isPending } = useSupprimerLicence();

  const copierCle = () => {
    navigator.clipboard?.writeText(cle);
    toast.success(`Clé « ${cle} » copiée dans le presse-papiers`);
  };

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
        <DropdownMenuItem>Gérer l'abonnement</DropdownMenuItem>
        <DropdownMenuItem>Attribuer des sièges</DropdownMenuItem>
        <DropdownMenuItem onClick={copierCle}>
          <IconCopy />
          Copier la clé
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() => mutate(id)}
        >
          <IconTrash />
          Révoquer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
