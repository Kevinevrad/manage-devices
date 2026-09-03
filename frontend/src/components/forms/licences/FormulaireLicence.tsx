import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

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
import { useCreerLicence } from "@/hooks/api";

interface FormulaireLicenceProps {
  /** Contrôle l'ouverture du panneau. */
  ouvert: boolean;
  /** Fermeture demandée (après succès ou annulation). */
  onFermer: () => void;
}

const donneesInitiales = {
  nom: "",
  editeur: "",
  cleLicence: "",
  typeLicence: "Abonnement",
  siegesTotal: "",
  coutAnnuel: "",
  dateExp: "",
};

/** Panneau latéral de création d'une licence. */
export function FormulaireLicence({
  ouvert,
  onFermer,
}: FormulaireLicenceProps) {
  const { mutateAsync, isPending } = useCreerLicence();
  const [donnees, setDonnees] = useState(donneesInitiales);

  const modifier =
    (champ: keyof typeof donneesInitiales) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setDonnees((precedent) => ({
        ...precedent,
        [champ]: event.target.value,
      }));

  async function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const perpetuelle = donnees.typeLicence === "Perpétuelle";
    const sieges = donnees.siegesTotal === "" ? null : Number(donnees.siegesTotal);
    const cout = donnees.coutAnnuel === "" ? null : Number(donnees.coutAnnuel);
    if (
      (sieges !== null && (!Number.isInteger(sieges) || sieges <= 0)) ||
      (cout !== null && (!Number.isFinite(cout) || cout < 0))
    ) {
      return; // Validation native HTML déjà en place — ceinture et bretelles
    }
    try {
      await mutateAsync({
        nom: donnees.nom,
        editeur: donnees.editeur,
        cleLicence: donnees.cleLicence,
        typeLicence: donnees.typeLicence,
        siegesTotal: sieges,
        coutAnnuel: perpetuelle ? null : cout,
        dateExp: perpetuelle ? null : donnees.dateExp === "" ? null : donnees.dateExp,
      });
      setDonnees(donneesInitiales);
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
          <SheetTitle>Ajouter une licence</SheetTitle>
          <SheetDescription>
            Abonnement ou licence perpétuelle : sièges, coût et échéance.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={soumettre} className="flex flex-col gap-4 px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="licence-nom">Nom du logiciel</FieldLabel>
              <Input
                id="licence-nom"
                required
                placeholder="Notion Business"
                value={donnees.nom}
                onChange={modifier("nom")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="licence-editeur">Éditeur</FieldLabel>
              <Input
                id="licence-editeur"
                required
                placeholder="Notion"
                value={donnees.editeur}
                onChange={modifier("editeur")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="licence-cle">Clé / contrat</FieldLabel>
              <Input
                id="licence-cle"
                required
                placeholder="NTN-BIZ-3321"
                value={donnees.cleLicence}
                onChange={modifier("cleLicence")}
              />
            </Field>
            <Field>
              <FieldLabel>Type de licence</FieldLabel>
              <Select
                value={donnees.typeLicence}
                onValueChange={(value) =>
                  setDonnees((precedent) => ({
                    ...precedent,
                    typeLicence: String(value),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Abonnement">Abonnement</SelectItem>
                  <SelectItem value="Perpétuelle">Perpétuelle</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="licence-sieges">Sièges couverts</FieldLabel>
              <Input
                id="licence-sieges"
                type="number"
                min={1}
                placeholder="20"
                value={donnees.siegesTotal}
                onChange={modifier("siegesTotal")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="licence-cout">Coût annuel (€)</FieldLabel>
              <Input
                id="licence-cout"
                type="number"
                min={0}
                step="0.01"
                placeholder="2160"
                value={donnees.coutAnnuel}
                onChange={modifier("coutAnnuel")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="licence-dateexp">
                Date d'expiration
              </FieldLabel>
              <Input
                id="licence-dateexp"
                type="date"
                value={donnees.dateExp}
                onChange={modifier("dateExp")}
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
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Création…" : "Créer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}