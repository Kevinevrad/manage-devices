/**
 * Client HTTP minimal pour l'API backend (manage-device).
 * - Base URL configurable via VITE_API_URL (proxy Vite en développement).
 * - Erreurs normalisées dans ApiClientError avec le message renvoyé par l'API.
 */

import type {
  AffectationApi,
  DonneesInscription,
  EquipementApi,
  LicenceApi,
  ReponseAuth,
  UtilisateurApi,
} from "@/types/api";

const API_URL: string = import.meta.env.VITE_API_URL ?? "/api";

const CLE_JETTON = "manage-device:jetton";

/** Jeton de session en mémoire, restauré depuis localStorage au démarrage. */
let jettonCourant: string | null = localStorage.getItem(CLE_JETTON);

/** Retourne le jeton de session courant (null si visiteur). */
export function obtenirJetton(): string | null {
  return jettonCourant;
}

/** Enregistre le jeton de session (mémoire + localStorage). */
export function definirJetton(jetton: string): void {
  jettonCourant = jetton;
  localStorage.setItem(CLE_JETTON, jetton);
}

/** Supprime le jeton de session (déconnexion ou session expirée). */
export function supprimerJetton(): void {
  jettonCourant = null;
  localStorage.removeItem(CLE_JETTON);
}

/** Erreur transportant le code HTTP et le message renvoyés par l'API. */
export class ApiClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

type ParametresRequete = Record<string, string | number | boolean | undefined>;

/** Sérialise des filtres en query string (les valeurs vides sont ignorées). */
function construireQueryString(parametres: ParametresRequete): string {
  const recherche = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur !== undefined && valeur !== "") {
      recherche.set(cle, String(valeur));
    }
  }
  const chaine = recherche.toString();
  return chaine ? `?${chaine}` : "";
}

/** Requête générique : JSON en entrée, JSON en sortie, erreurs normalisées. */
async function requete<T>(chemin: string, init?: RequestInit): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(`${API_URL}${chemin}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(jettonCourant
          ? { Authorization: `Bearer ${jettonCourant}` }
          : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      0,
      "Impossible de joindre le serveur. Vérifiez que l'API backend est démarrée.",
    );
  }

  if (!reponse.ok) {
    // Session expirée ou révoquée côté serveur : nettoyage du jeton local
    if (reponse.status === 401 && jettonCourant !== null) {
      supprimerJetton();
    }
    const corps = (await reponse.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new ApiClientError(
      reponse.status,
      corps?.error ?? `Erreur ${reponse.status} lors de l'appel à ${chemin}.`,
    );
  }

  if (reponse.status === 204) return undefined as T;
  return (await reponse.json()) as T;
}

export interface EquipementFiltres {
  statut?: string;
  categorie?: string;
  /** Recherche plein texte (nom, marque, n° de série) */
  recherche?: string;
}

export interface LogicielFiltres {
  type?: string;
  recherche?: string;
  /** Licences expirant dans les X prochains jours */
  expireSous?: number;
}

export interface AffectationFiltres {
  equipementId?: number;
  userId?: number;
  /** true = affectations encore ouvertes (dateFin null) */
  ouvertes?: boolean;
}

/**
 * Points d'entrée de l'API : authentification (public) + lectures métier
 * (protégées par le JWT, envoyé automatiquement via requete()).
 * Les mutations métier suivront avec les formulaires.
 */
export const api = {
  auth: {
    inscrire: (donnees: DonneesInscription) =>
      requete<ReponseAuth>("/auth/inscrire", {
        method: "POST",
        body: JSON.stringify(donnees),
      }),
    connecter: (donnees: { email: string; motDePasse: string }) =>
      requete<ReponseAuth>("/auth/connecter", {
        method: "POST",
        body: JSON.stringify(donnees),
      }),
    /** Profil de l'utilisateur porteur du jeton (401 si session expirée). */
    moi: () => requete<UtilisateurApi>("/auth/moi"),
  },
  equipements: {
    lister: (filtres: EquipementFiltres = {}) =>
      requete<EquipementApi[]>(
        `/equipements${construireQueryString({
          statut: filtres.statut,
          categorie: filtres.categorie,
          q: filtres.recherche,
        })}`,
      ),
    obtenir: (id: number) => requete<EquipementApi>(`/equipements/${id}`),
  },
  logiciels: {
    lister: (filtres: LogicielFiltres = {}) =>
      requete<LicenceApi[]>(
        `/logiciels${construireQueryString({
          type: filtres.type,
          q: filtres.recherche,
          expireSous: filtres.expireSous,
        })}`,
      ),
    obtenir: (id: number) => requete<LicenceApi>(`/logiciels/${id}`),
  },
  utilisateurs: {
    lister: () => requete<UtilisateurApi[]>("/users"),
    obtenir: (id: number) => requete<UtilisateurApi>(`/users/${id}`),
  },
  affectations: {
    lister: (filtres: AffectationFiltres = {}) =>
      requete<AffectationApi[]>(
        `/affectations${construireQueryString({
          equipementId: filtres.equipementId,
          userId: filtres.userId,
          ouvertes: filtres.ouvertes,
        })}`,
      ),
    obtenir: (id: number) => requete<AffectationApi>(`/affectations/${id}`),
  },
};
 