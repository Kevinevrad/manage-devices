import { Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FieldGroup,
} from "@/components";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  Input,
  FieldDescription,
  Button,
} from "@/components";

import type { RegisterFormProps } from "./register.types";

export const RegisterForm = ({ className, ...props }: RegisterFormProps) => {
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
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nom complet</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Adresse email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="prenom.nom@entreprise.com"
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input id="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmation
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required />
                  </Field>
                </Field>
                <FieldDescription>
                  Doit contenir au moins 8 caractères.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Créer mon compte</Button>
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
