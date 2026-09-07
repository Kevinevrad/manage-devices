import { useState } from "react";
import { IconX } from "@tabler/icons-react";

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components";
import { useCreerOrganisation } from "@/hooks/api";

interface FormulaireOrganisationProps {
  onFermer: () => void;
}

export function FormulaireOrganisation({ onFermer }: FormulaireOrganisationProps) {
  const [nom, setNom] = useState("");
  const creerMutation = useCreerOrganisation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    creerMutation.mutate(
      { nom: nom.trim() },
      { onSuccess: onFermer },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Créer une organisation</CardTitle>
          <Button variant="ghost" size="icon" onClick={onFermer}>
            <IconX size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nom-organisation" className="text-sm font-medium">
                Nom de l'organisation
              </label>
              <Input
                id="nom-organisation"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Infratp"
                disabled={creerMutation.isPending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onFermer}>
                Annuler
              </Button>
              <Button type="submit" disabled={creerMutation.isPending || !nom.trim()}>
                {creerMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}