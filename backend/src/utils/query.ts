/**
 * Helpers pour lire les query strings Express (valeurs possiblement
 * répétées : ?statut=a&statut=b).
 */

/** Extrait la première valeur texte d'un paramètre de requête. */
export const premierTexte = (valeur: unknown): string | undefined => {
  if (typeof valeur === "string") return valeur;
  if (Array.isArray(valeur)) {
    const premier = valeur[0];
    if (typeof premier === "string") return premier;
  }
  return undefined;
};

/** Convertit un paramètre de requête en entier strictement positif. */
export const entierOuIndefini = (valeur: unknown): number | undefined => {
  const texte = premierTexte(valeur);
  if (texte === undefined) return undefined;
  const nombre = Number(texte);
  return Number.isInteger(nombre) && nombre > 0 ? nombre : undefined;
};