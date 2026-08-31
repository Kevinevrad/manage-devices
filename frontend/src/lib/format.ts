/**
 * Petits utilitaires de formatage partagés (fr-FR).
 * Utilisés par les données de démonstration et les tables.
 */

const eurosFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Formate un montant en euros : 1249 → "1 249 €" */
export const formatEuros = (value: number) => eurosFormatter.format(value);

/** Formate une date ISO : "2024-02-14" → "14 févr. 2024" */
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

/** Extrait les initiales d'un nom complet : "Kevin Assoko" → "KA" */
export const initials = (fullName: string) =>
  fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();