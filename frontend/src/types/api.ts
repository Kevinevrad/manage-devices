/**
 * Types des réponses de l'API backend (manage-device).
 * Miroir des DTO renvoyés par Express/Prisma — à maintenir aligné avec
 * backend/src/services/*.service.ts. Les dates arrivent en ISO 8601 (JSON).
 */

/** Référence réduite d'un utilisateur (embarquée dans un équipement). */
export interface UtilisateurReference {
  id: number;
  nom: string;
  prenom: string;
}

/** Équipement brut tel que stocké côté backend (modèle Prisma `Equipement`). */
export interface EquipementBrut {
  id: number;
  nom: string;
  type: string;
  marque: string;
  prix: number;
  numSerie: string;
  statut: string;
  dateAchat: string;
  userId: number | null;
}

/** Affectation brute (modèle Prisma `Affectation`). */
export interface AffectationBrut {
  id: number;
  equipementId: number;
  userId: number;
  dateDebut: string;
  dateFin: string | null;
  commentaire: string | null;
}

/** Logiciel brut (modèle Prisma `Logiciel`). */
export interface LogicielBrut {
  id: number;
  nom: string;
  editeur: string;
  cleLicence: string;
  dateAchat: string;
  /** null pour une licence perpétuelle sans échéance */
  dateExp: string | null;
  typeLicence: string;
  /** Nombre de postes couverts (null = illimité) */
  siegesTotal: number | null;
  /** Coût annuel en euros (null pour une licence perpétuelle) */
  coutAnnuel: number | null;
}

/** Installation d'une licence sur un équipement (jointure LicencesSurEquipement). */
export interface LicenceInstallee {
  equipementId: number;
  logicielId: number;
  installeLe: string;
  logiciel: LogicielBrut;
}

/** Utilisateur enrichi (DTO de GET /api/users). */
export interface UtilisateurApi {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  structure: string;
  service: string;
  role: string;
  /** Nom complet calculé par le backend */
  nomComplet: string;
  equipements: EquipementBrut[];
  historiquesAffectations: AffectationBrut[];
  _count: {
    equipements: number;
    historiquesAffectations: number;
  };
}

/** Équipement enrichi (DTO de GET /api/equipements). */
export interface EquipementApi extends EquipementBrut {
  utilisateur: UtilisateurReference | null;
  logiciels: LicenceInstallee[];
  /** Nom complet de l'utilisateur affecté (calculé par le backend) */
  affecteA: string | null;
}

/** Licence (DTO de GET /api/logiciels). */
export interface LicenceApi {
  id: number;
  /** Nom commercial du logiciel */
  logiciel: string;
  editeur: string;
  /** Clé de produit ou identifiant d'abonnement */
  cle: string;
  type: string;
  siegesTotal: number | null;
  siegesUtilises: number;
  dateAchat: string;
  /** null pour une licence perpétuelle */
  dateExpiration: string | null;
  coutAnnuel: number | null;
}

/** Affectation enrichie (DTO de GET /api/affectations). */
export interface AffectationApi extends AffectationBrut {
  /** Équipement concerné (relation `equipements`) */
  equipements: EquipementBrut;
  /** Utilisateur concerné */
  user: UtilisateurApi;
}

/** Réponse des endpoints /auth/inscrire et /auth/connecter. */
export interface ReponseAuth {
  utilisateur: UtilisateurApi;
  /** JWT de session à envoyer en header « Authorization: Bearer … » */
  jetton: string;
}

/** Données du formulaire d'inscription (rôle forcé à « user » côté API). */
export interface DonneesInscription {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  structure: string;
  service: string;
}
