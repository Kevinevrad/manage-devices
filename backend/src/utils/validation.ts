import { ApiError } from "./api-error";

/** Vérifie qu'une valeur est un texte non vide et la retourne (trim). */
export function texteObligatoire(valeur: unknown, champ: string): string {
  if (typeof valeur !== "string" || valeur.trim().length === 0) {
    throw ApiError.badRequest(`Le champ « ${champ} » est obligatoire.`);
  }
  return valeur.trim();
}

/** Retourne un texte optionnel (undefined si absent ou vide). */
export function texteOptionnel(valeur: unknown): string | undefined {
  if (typeof valeur !== "string" || valeur.trim().length === 0) {
    return undefined;
  }
  return valeur.trim();
}

/** Vérifie qu'une valeur est un nombre fini et la retourne. */
export function nombreObligatoire(valeur: unknown, champ: string): number {
  const nombre = typeof valeur === "string" ? Number(valeur) : valeur;
  if (typeof nombre !== "number" || !Number.isFinite(nombre)) {
    throw ApiError.badRequest(`Le champ « ${champ} » doit être un nombre.`);
  }
  return nombre;
}

/** Vérifie qu'une valeur est un entier (strictement positif par défaut). */
export function entierObligatoire(
  valeur: unknown,
  champ: string,
  positif = true,
): number {
  const nombre = typeof valeur === "string" ? Number(valeur) : valeur;
  if (
    typeof nombre !== "number" ||
    !Number.isInteger(nombre) ||
    (positif && nombre <= 0)
  ) {
    throw ApiError.badRequest(
      `Le champ « ${champ} » doit être un entier${positif ? " positif" : ""}.`,
    );
  }
  return nombre;
}

/** Convertit une chaîne ISO en Date si fournie, sinon undefined. */
export function dateOptionnelle(valeur: unknown, champ: string): Date | undefined {
  if (valeur === undefined || valeur === null || valeur === "") return undefined;
  const date = new Date(String(valeur));
  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest(
      `Le champ « ${champ} » doit être une date valide (format ISO).`,
    );
  }
  return date;
}

/** Convertit un paramètre d'URL (ex: /:id) en entier valide, sinon 404. */
export function identifiantObligatoire(valeur: unknown): number {
  const id = typeof valeur === "string" ? Number(valeur) : Number.NaN;
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.notFound("Identifiant invalide.");
  }
  return id;
}