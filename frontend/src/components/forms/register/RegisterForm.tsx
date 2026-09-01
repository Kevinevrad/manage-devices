import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FieldGroup,
} from "@/components";
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  Input,
  FieldDescription,
  Button,
} from "@/components";

import type { RegisterFormProps } from "./register.types";

const donneesInitiales = {
  prenom: "",
  nom: "",
  structure: "",
  service: "",
  email: "",
  motDePasse: "",
  confirmation: "",
};

export const RegisterForm = ({ className, ...props }: RegisterFormProps) => {
  const navigate = useNavigate();
  const { inscrire } = useAuth();
  const [donnees, setDonnees] = useState(donneesInitiales);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const modifier =
    (champ: keyof typeof donneesInitiales) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setDonnees((precedent) => ({
        ...precedent,
        [champ]: event.target.value,
      }));

  async function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (donnees.motDePasse !== donnees.confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    if (donnees.motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await inscrire({
        nom: donnees.nom,
        prenom: donnees.prenom,
        email: donnees.email,
        motDePasse: donnees.motDePasse,
        structure: donnees.structure,
        service: donnees.service,
      });
      await navigate({ to: "/dashboard" });
    } catch (error) {
      setErreur(
        error instanceof Error ? error.message : "Inscription impossible.",
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>
            Renseignez vos informations pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={soumettre}>
            <FieldGroup>
              <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
                    <Input
                      id="prenom"
                      type="text"
                      placeholder="Jean"
                      required
                      value={donnees.prenom}
                      onChange={modifier("prenom")}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="nom">Nom</FieldLabel>
                    <Input
                      id="nom"
                      type="text"
                      placeholder="Dupont"
                      required
                      value={donnees.nom}
                      onChange={modifier("nom")}
                    />
                  </Field>
                </Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="structure">Structure</FieldLabel>
                    <Input
                      id="structure"
                      type="text"
                      placeholder="infratp"
                      required
                      value={donnees.structure}
                      onChange={modifier("structure")}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="service">Service</FieldLabel>
                    <Input
                      id="service"
                      type="text"
                      placeholder="Informatique"
                      required
                      value={donnees.service}
                      onChange={modifier("service")}
                    />
                  </Field>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Adresse email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="prenom.nom@entreprise.com"
                    required
                    autoComplete="email"
                    value={donnees.email}
                    onChange={modifier("email")}
                  />
                </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={donnees.motDePasse}
                      onChange={modifier("motDePasse")}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmation
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={donnees.confirmation}
                      onChange={modifier("confirmation")}
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Doit contenir au moins 8 caractères.
                </FieldDescription>
              </Field>
              {erreur && (
                <p className="flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-400">
                  <IconAlertCircle className="size-4 shrink-0" />
                  {erreur}
                </p>
              )}
              <Field>
                <Button type="submit" disabled={envoi}>
                  {envoi ? "Création…" : "Créer mon compte"}
                </Button>
                <FieldDescription className="text-center">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Se connecter
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
