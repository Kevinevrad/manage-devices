/**
 * Export CSV : récupère le contenu (text/csv) depuis l'API, puis lance le
 * téléchargement côté navigateur.
 */

import { requerirTexte } from "./api";

/** Télécharge le contenu d'une ressource CSV de l'API sous un nom de fichier. */
export async function exportarCSV(
  chemin: string,
  nomFichier: string,
): Promise<void> {
  const csv = await requerirTexte(chemin);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  URL.revokeObjectURL(url);
  lien.remove();
}