import { useState } from "react";
import type { FormEvent } from "react";

import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { useCreerAffectation, useEquipements, useUtilisateurs } from "@/hooks/api";

interface FormulaireAffectationProps {
  /** Contrôle l'ouverture du panneau. */
  ouvert: boolean;
  /** Fermeture demandée (après succès ou annulation). */
  onFermer: () => void;
}

/** Panneau latéral de création d'une affectation. */
export function FormulaireAffectation({
  ouvert,
  onFermer,
}: FormulaireAffectationProps) {
  const { mutateAsync, isPending } = useCreerAffectation();
  const { data: equipements } = useEquipements();
  const { data: utilisateurs } = useUtilisateurs();

  const [equipementId, setEquipementId] = useState("");
  const [userId, setUserId] = useState("");
  const [commentaire, setCommentaire] = useState("");

  async function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (equipementId === "" || userId === "") return;
    try {
      await mutateAsync({
        equipementId: Number(equipementId),
        userId: Number(userId),
        ...(commentaire !== "" ? { commentaire } : {}),
      });
      setEquipementId("");
      setUserId("");
      setCommentaire("");
      onFermer();
    } catch {
      // L'erreur est déjà notifiée par le hook de mutation
    }
  }

  return (
    <Sheet
      open={ouvert}
      onOpenChange={(nouvelEtat) => {
        if (!nouvelEtat) onFermer();
      }}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nouvelle affectation</SheetTitle>
          <SheetDescription>
            Confiez un équipement du parc à un utilisateur.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={soumettre} className="flex flex-col gap-4 px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Équipement</FieldLabel>
              <Select
                value={equipementId}
                onValueChange={(value) => setEquipementId(String(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un équipement" />
                </SelectTrigger>
                <SelectContent>
                  {(equipements ?? []).map((equipement) => (
                    <SelectItem
                      key={equipement.id}
                      value={String(equipement.id)}
                    >
                      {equipement.nom} — {equipement.numSerie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Utilisateur</FieldLabel>
              <Select
                value={userId}
                onValueChange={(value) => setUserId(String(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {(utilisateurs ?? []).map((utilisateur) => (
                    <SelectItem
                      key={utilisateur.id}
                      value={String(utilisateur.id)}
                    >
                      {utilisateur.nomComplet} — {utilisateur.service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="affectation-commentaire">
                Commentaire (optionnel)
              </FieldLabel>
              <Input
                id="affectation-commentaire"
                placeholder="Remis avec chargeur et sacoche"
                value={commentaire}
                onChange={(event) => setCommentaire(event.target.value)}
              />
            </Field>
          </FieldGroup>
          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onFermer}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || equipementId === "" || userId === ""}
            >
              {isPending ? "Affectation…" : "Affecter"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}