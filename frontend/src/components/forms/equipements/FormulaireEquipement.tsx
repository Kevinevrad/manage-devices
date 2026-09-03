import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";

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
import { equipementStatuts } from "@/data/equipements";
import { useCreerEquipement } from "@/hooks/api";

/** Types d'équipement proposés à la création. */
const TYPES_EQUIPEMENT = [
  "Ordinateur portable",
  "Poste fixe",
  "Écran",
  "Imprimante",
  "Smartphone",
  "Station d'accueil",
];

interface FormulaireEquipementProps {
  /** Contrôle l'ouverture du panneau. */
  ouvert: boolean;
  /** Fermeture demandée (après succès ou annulation). */
  onFermer: () => void;
}

const donneesInitiales = {
  nom: "",
  type: TYPES_EQUIPEMENT[0] ?? "",
  marque: "",
  prix: "",
  numSerie: "",
  statut: "Non Affecté",
  dateAchat: "",
};

/** Panneau latéral de création d'un équipement. */
export function FormulaireEquipement({
  ouvert,
  onFermer,
}: FormulaireEquipementProps) {
  const { mutateAsync, isPending } = useCreerEquipement();
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
    const prix = Number(donnees.prix);
    if (!Number.isFinite(prix) || prix < 0) {
      toast.error("Le prix doit être un nombre positif.");
      return;
    }
    try {
      await mutateAsync({
        nom: donnees.nom,
        type: donnees.type,
        marque: donnees.marque,
        prix,
        numSerie: donnees.numSerie,
        ...(donnees.statut !== "Non Affecté"
          ? { statut: donnees.statut }
          : {}),
        ...(donnees.dateAchat !== "" ? { dateAchat: donnees.dateAchat } : {}),
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
          <SheetTitle>Ajouter un équipement</SheetTitle>
          <SheetDescription>
            Renseignez les caractéristiques du nouveau matériel du parc.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={soumettre} className="flex flex-col gap-4 px-4 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="equipement-nom">Nom</FieldLabel>
              <Input
                id="equipement-nom"
                required
                placeholder="Latitude 5540"
                value={donnees.nom}
                onChange={modifier("nom")}
              />
            </Field>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={donnees.type}
                onValueChange={(value) =>
                  setDonnees((precedent) => ({
                    ...precedent,
                    type: String(value),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_EQUIPEMENT.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="equipement-marque">Marque</FieldLabel>
              <Input
                id="equipement-marque"
                required
                placeholder="Dell"
                value={donnees.marque}
                onChange={modifier("marque")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="equipement-prix">Prix (€)</FieldLabel>
              <Input
                id="equipement-prix"
                type="number"
                min={0}
                step="0.01"
                required
                placeholder="1249"
                value={donnees.prix}
                onChange={modifier("prix")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="equipement-numserie">
                Numéro de série
              </FieldLabel>
              <Input
                id="equipement-numserie"
                required
                placeholder="SN-LAP-0455"
                value={donnees.numSerie}
                onChange={modifier("numSerie")}
              />
            </Field>
            <Field>
              <FieldLabel>Statut</FieldLabel>
              <Select
                value={donnees.statut}
                onValueChange={(value) =>
                  setDonnees((precedent) => ({
                    ...precedent,
                    statut: String(value),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipementStatuts.map((statut) => (
                    <SelectItem key={statut} value={statut}>
                      {statut}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="equipement-dateachat">
                Date d'achat
              </FieldLabel>
              <Input
                id="equipement-dateachat"
                type="date"
                value={donnees.dateAchat}
                onChange={modifier("dateAchat")}
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