/**
 * Vocabulaire métier : correspondance entre les valeurs d'enum stockées en
 * base (identifiants ASCII — les identifiants d'enum Prisma n'autorisent ni
 * espaces ni accents) et les libellés français exposés par l'API
 * (contrat stable avec le frontend et les tests).
 */

/** Statuts d'un équipement (valeurs stockées en base). */
export const StatutEquipement = {
  NonAffecte: "Non_Affecte",
  EnService: "En_service",
  EnStock: "En_stock",
  EnPanne: "En_panne",
  Rebut: "Rebut",
} as const;

export type StatutEquipement =
  (typeof StatutEquipement)[keyof typeof StatutEquipement];

/** Libellés français exposés par l'API. */
export const LIBELLES_STATUT_EQUIPEMENT: Record<StatutEquipement, string> = {
  [StatutEquipement.NonAffecte]: "Non Affecté",
  [StatutEquipement.EnService]: "En service",
  [StatutEquipement.EnStock]: "En stock",
  [StatutEquipement.EnPanne]: "En panne",
  [StatutEquipement.Rebut]: "Rebut",
};

/** Liste des libellés acceptés (pour les messages d'erreur). */
export const libellesStatutEquipement = (): string[] =>
  Object.values(LIBELLES_STATUT_EQUIPEMENT);

/** Libellé français → valeur d'enum (undefined si inconnu). */
export const statutEquipementDepuisLibelle = (
  label: string,
): StatutEquipement | undefined => {
  const entree = Object.entries(LIBELLES_STATUT_EQUIPEMENT).find(
    ([, libelle]) => libelle === label,
  );
  return entree?.[0] as StatutEquipement | undefined;
};

/** Valeur d'enum → libellé français. */
export const libelleDepuisStatutEquipement = (
  statut: StatutEquipement,
): string => LIBELLES_STATUT_EQUIPEMENT[statut];

/** Types de licence (valeurs stockées en base). */
export const TypeLicence = {
  Abonnement: "Abonnement",
  Perpetuelle: "Perpetuelle",
} as const;

export type TypeLicence = (typeof TypeLicence)[keyof typeof TypeLicence];

/** Libellés français exposés par l'API. */
export const LIBELLES_TYPE_LICENCE: Record<TypeLicence, string> = {
  [TypeLicence.Abonnement]: "Abonnement",
  [TypeLicence.Perpetuelle]: "Perpétuelle",
};

/** Liste des libellés acceptés (pour les messages d'erreur). */
export const libellesTypeLicence = (): string[] =>
  Object.values(LIBELLES_TYPE_LICENCE);

/** Libellé français → valeur d'enum (undefined si inconnu). */
export const typeLicenceDepuisLibelle = (
  label: string,
): TypeLicence | undefined => {
  const entree = Object.entries(LIBELLES_TYPE_LICENCE).find(
    ([, libelle]) => libelle === label,
  );
  return entree?.[0] as TypeLicence | undefined;
};

/** Valeur d'enum → libellé français. */
export const libelleDepuisTypeLicence = (type: TypeLicence): string =>
  LIBELLES_TYPE_LICENCE[type];

/** Rôles d'un utilisateur (valeurs identiques en base et exposées). */
export const ROLES_UTILISATEUR = ["user", "admin", "technicien"] as const;

export type RoleUtilisateur = (typeof ROLES_UTILISATEUR)[number];