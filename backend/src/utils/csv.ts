/**
 * Utilitaires CSV (séparateur point-virgule, compatible Excel FR).
 * Les cellules contenant le séparateur, des guillemets ou un retour
 * ligne sont échappées et encapsulées.
 */

export function ligneCSV(
  cellules: (string | number | null | undefined)[],
): string {
  return cellules
    .map((cellule) => {
      const valeur =
        cellule === null || cellule === undefined ? "" : String(cellule);
      if (
        valeur.includes(";") ||
        valeur.includes('"') ||
        valeur.includes("\n")
      ) {
        return `"${valeur.replaceAll('"', '""')}"`;
      }
      return valeur;
    })
    .join(";");
}

/** Préfixe BOM pour que Excel détecte l'encodage UTF-8. */
export const BOM_UTF8 = "\uFEFF";