# Référence de l'API REST

Documentation des endpoints exposés par le backend (`backend/`).

- **URL de base** : `http://localhost:3000/api` — toutes les routes ci-dessous sont relatives à ce préfixe.
- **Échanges** : JSON, encodage UTF-8.
- **Dates** : ISO 8601 (ex. `2024-02-14T00:00:00.000Z`).
- **Authentification** : JWT via l'en-tête `Authorization: Bearer <jeton>` (détail plus bas).

## Authentification

Un jeton s'obtient via `POST /auth/inscrire` ou `POST /auth/connecter`. Toutes les routes métier l'exigent : `401` sans jeton, jeton expiré ou falsifié. `DELETE /users/:id` exige en outre le rôle `admin` : `403` sinon.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Le jeton embarque `{ id, role }` et expire après `JWT_EXPIRE_IN` (7 jours par défaut — voir `backend/.env.example`).

## Format des erreurs

Toute erreur renvoie un objet `error` (et parfois `code` pour les erreurs Prisma) :

```json
{ "error": "Équipement 99 introuvable." }
```

| Code | Signification |
|---|---|
| 400 | Requête invalide (champ manquant, valeur hors liste, JSON malformé…) |
| 401 | Jeton absent, invalide ou expiré |
| 403 | Authentifié mais droits insuffisants (route admin) |
| 404 | Ressource introuvable |
| 409 | Conflit d'unicité (n° de série, e-mail, clé de licence) ou sièges de licence épuisés |
| 500 | Erreur interne (détail jamais exposé au client) |

⚠️ Le hash bcrypt du mot de passe (`motDePasse`) n'est **jamais** renvoyé par l'API.

## Sommaire

| Ressource | Routes |
|---|---|
| Santé | `GET /health` |
| Authentification | `POST /auth/inscrire`, `POST /auth/connecter`, `GET /auth/moi` |
| Équipements | CRUD + gestion des licences installées |
| Licences | CRUD |
| Organisations | CRUD (écriture réservée aux admins) |
| Utilisateurs | CRUD |
| Affectations | historique + retour matériel |

---

## Endpoints

### Santé

| Méthode | Route | Auth |
|---|---|---|
| GET | `/health` | non |

```json
{ "status": "ok", "timestamp": "2026-09-02T10:00:00.000Z" }
```

### Authentification

#### POST /auth/inscrire — 201

Crée un compte et renvoie un jeton. Le rôle est **forcé à `user`** (pas d'auto-promotion).

Corps :

```json
{
  "nom": "Assoko",
  "prenom": "Kevin",
  "email": "kevin.assoko@infratp.com",
  "motDePasse": "Password123!",
  "structure": "infratp",
  "service": "Informatique"
}
```

Réponse :

```json
{
  "utilisateur": {
    "id": 6, "nom": "Assoko", "prenom": "Kevin",
    "email": "kevin.assoko@infratp.com", "structure": "infratp",
    "service": "Informatique", "role": "user", "nomComplet": "Kevin Assoko"
  },
  "jetton": "eyJhbGciOi..."
}
```

Erreurs : `400` (mot de passe < 8 caractères, e-mail mal formé, champ manquant), `409` (e-mail déjà pris).

#### POST /auth/connecter — 200

Corps : `{ "email", "motDePasse" }`. Même forme de réponse que l'inscription. Erreur : `401` avec message volontairement générique (`"E-mail ou mot de passe incorrect."`) pour ne pas révéler l'existence d'un compte.

#### GET /auth/moi — 200

Profil de l'utilisateur porteur du jeton (objet `utilisateur` seul). Erreur : `401`.

### Équipements

Champs : `id`, `nom`, `type`, `marque`, `prix` (€), `numSerie` (**unique**), `statut` (`Non Affecté` · `En service` · `En stock` · `En panne` · `Rebut`, défaut `Non Affecté`), `dateAchat`, `userId`.

> 💡 **Enums** : `statut`, `role` et `typeLicence` sont des **enums Prisma**. En base, les valeurs sont stockées sous forme d'identifiants ASCII (`Non_Affecte`, `En_service`, `En_stock`, `En_panne`, `Rebut`) car les identifiants d'enum n'autorisent ni espaces ni accents ; l'API conserve le **contrat en libellés français** (entrée et sortie) via la couche de mapping `backend/src/domain/statuts.ts`.

Le DTO ajoute :

- `affecteA` — « Prénom Nom » de l'utilisateur courant, ou `null` ;
- `utilisateur` — `{ id, nom, prenom }` ou `null` ;
- `logiciels` — licences installées : `[{ equipementId, logicielId, installeLe, logiciel: {…} }]`.

#### GET /equipements — 200

Filtres combinables : `?statut=En service` · `?categorie=Ordinateur portable` (alias `?type=`) · `?q=texte` (recherche insensible sur `nom`, `marque`, `numSerie`) · `?organisationId=`. Tri par `id` croissant.

#### GET /equipements/:id — 200 · `404` si inconnu

#### POST /equipements — 201

Obligatoire : `nom`, `type`, `marque`, `prix`, `numSerie`. Optionnels : `statut`, `dateAchat`, `userId` (affectation directe → statut « En service »).

Erreurs : `400` (champ manquant, statut hors liste), `409` (n° de série déjà utilisé).

#### PUT /equipements/:id — 200 (mise à jour partielle)

Tous champs optionnels. Règles métier :

- `userId: null` → désaffecte et repasse « En stock » (sauf `statut` explicite dans la même requête) ;
- `userId: <id>` → rattache et passe « En service » (sauf `statut` explicite).

Erreur : `409` si le nouveau `numSerie` est déjà pris.

#### DELETE /equipements/:id — 204

Supprime l'équipement, ses installations de licences et son historique d'affectations (cascade).

#### Licences installées

| Méthode | Route | Description |
|---|---|---|
| GET | `/equipements/:id/logiciels` | Licences installées sur l'équipement |
| POST | `/equipements/:id/logiciels` | Installe une licence — corps `{ "logicielId": 1 }` → `201` |
| DELETE | `/equipements/:id/logiciels/:logicielId` | Désinstalle → `204` |

`POST` occupe un siège de la licence. Erreurs : `400` (logiciel inconnu), `404` (désinstallation d'une licence non installée), `409` (**tous les sièges sont déjà utilisés**).

### Licences (logiciels)

Champs : `id`, `nom`, `editeur`, `cleLicence` (**unique**), `typeLicence` (`Abonnement` · `Perpétuelle` — enum stockée `Abonnement` / `Perpetuelle`), `siegesTotal` (nombre de postes couverts), `coutAnnuel` (€), `dateAchat`, `dateExp` (`null` pour une licence perpétuelle).

Le DTO est aligné sur le type `Licence` du frontend :

```json
{
  "id": 1,
  "logiciel": "Office 365 Business",
  "editeur": "Microsoft",
  "cle": "OFF365-BIZ-2024-001",
  "type": "Abonnement",
  "siegesTotal": 25,
  "siegesUtilises": 7,
  "dateAchat": "2024-01-15T00:00:00.000Z",
  "dateExpiration": "2025-01-15T00:00:00.000Z",
  "coutAnnuel": 4500
}
```

#### GET /logiciels — 200

Filtres combinables : `?type=Abonnement` · `?q=texte` (sur `nom`, `editeur`, `cleLicence`) · `?expireSous=30` (licences expirant dans les 30 prochains jours) · `?organisationId=`.

#### GET /logiciels/:id — 200 · `404` si inconnu

Ajoute `installations` :

```json
"installations": [
  { "equipementId": 3, "installeLe": "2024-06-01T00:00:00.000Z",
    "equipement": { "id": 3, "nom": "EliteDesk 800 G9", "numSerie": "SN-FIX-0107" } }
]
```

#### POST /logiciels — 201

Obligatoire : `nom`, `editeur`, `cleLicence`. Optionnels : `typeLicence` (défaut `Abonnement`), `siegesTotal`, `coutAnnuel` (≥ 0), `dateAchat`, `dateExp`.

Erreurs : `400` (type hors liste, coût négatif), `409` (clé déjà prise).

#### PUT /logiciels/:id — 200 (partielle)

`null` accepté pour `siegesTotal`, `coutAnnuel` et `dateExp` (licence perpétuelle sans limite).

#### DELETE /logiciels/:id — 204

Supprime la licence et désinstalle partout (cascade).

### Utilisateurs

Champs du DTO : `id`, `nom`, `prenom`, `email` (**unique**), `structure`, `service`, `role` (`user` · `admin` · `technicien`), `nomComplet`, `equipements` (rattachés), `historiquesAffectations`, `_count` (`equipements`, `historiquesAffectations`). Jamais de `motDePasse`.

#### GET /users — 200 · liste triée par `id` croissant

Filtre disponible : `?organisationId=`.

#### GET /users/:id — 200 · `404` si inconnu

#### POST /users — 201

Corps : `nom`, `prenom`, `email`, `motDePasse` (≥ 8 caractères), `structure`, `service` ; optionnel `role` (réservé à l'administration — contrairement à `/auth/inscrire` qui force `user`).

Erreurs : `400` (e-mail mal formé, mot de passe court), `409` (e-mail déjà pris).

#### PUT /users/:id — 200 (partielle) · `404` si inconnu

#### DELETE /users/:id — 204 · **réservé au rôle `admin`** (`403` sinon)

Les équipements de l'utilisateur sont détachés (`userId → null`) mais conservés.

### Affectations

Historique équipement ↔ utilisateur. Champs : `id`, `equipementId`, `userId`, `dateDebut`, `dateFin` (`null` = affectation en cours), `commentaire`, plus les objets inclus `equipements` (équipement complet) et `user` (sans le hash).

#### GET /affectations — 200

Filtres combinables : `?equipementId=` · `?userId=` · `?ouvertes=true` (affectations en cours uniquement) · `?organisationId=` (héritée de l'équipement). Tri par `dateDebut` décroissant.

#### POST /affectations — 201

Corps : `equipementId`, `userId` ; optionnels `commentaire`, `dateDebut` (défaut : maintenant).

Effets appliqués en une requête :

1. clôture automatique de l'affectation encore ouverte sur cet équipement (`dateFin = maintenant`) ;
2. création de la nouvelle affectation ;
3. équipement rattaché à l'utilisateur et passé « En service ».

Erreurs : `404` (équipement ou utilisateur inconnu).

#### GET /affectations/:id — 200 · `404` si inconnu

#### PATCH /affectations/:id/retour — 200

Clôture l'affectation (retour du matériel) : `dateFin` renseignée, équipement détaché de l'utilisateur et repassé « En stock ». Erreur : `400` si déjà clôturée.

### Organisations

Modèle multi-tenant (**mono-schéma**) : utilisateurs, équipements et licences peuvent être rattachés à une organisation via `organisationId` (nullable — une entité sans organisation reste visible). La suppression d'une organisation **détache** ses entités (`ON DELETE SET NULL`) sans les supprimer.

DTO :

```json
{
  "id": 1,
  "nom": "Infratp",
  "utilisateurs": 5,
  "equipements": 14,
  "logiciels": 12
}
```

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/organisations` | oui | Liste avec volumétries |
| GET | `/organisations/:id` | oui | Détail · `404` sinon |
| POST | `/organisations` | **admin** | Création — corps `{ "nom": "Infratp" }` → `201` |
| PUT | `/organisations/:id` | **admin** | Renommage partiel → `200` |
| DELETE | `/organisations/:id` | **admin** | Suppression → `204` (entités détachées) |

Erreurs : `400` (nom manquant), `403` (non-admin), `404`, `409` (nom déjà pris).

**Rattachement** : `organisationId` est accepté à la création et à la mise à jour des utilisateurs, équipements et licences (`null` en mise à jour = détacher) ; un `organisationId` inconnu renvoie `404`. Le DTO des utilisateurs, équipements et licences inclut l'objet `organisation : { id, nom }` ou `null`.

**Filtrage** : les listes de chaque ressource acceptent le filtre `?organisationId=` (les affectations filtrent via l'organisation de leur équipement).

> 🔒 **Isolation stricte par tenant** : le JWT embarque l'organisation de l'utilisateur. Règles appliquées à **toutes** les ressources :
> - rôle `admin` → **accès global** (support plateforme) ;
> - autre rôle **avec organisation** → cloisonné : seules les données de son organisation sont visibles et modifiables (tout accès hors tenant renvoie **404**, anti-IDOR ; les créations sont rattachées automatiquement à son organisation, `organisationId` du payload ignoré) ;
> - autre rôle **sans organisation** → non cloisonné (mode plateforme/démonstration).

---

## Exemples rapides (curl)

```bash
# Connexion (récupérer le jeton)
curl -X POST http://localhost:3000/api/auth/connecter \
  -H "Content-Type: application/json" \
  -d '{"email":"kevin.assoko@infratp.com","motDePasse":"Password123!"}'

# Lister les équipements en service
curl "http://localhost:3000/api/equipements?statut=En%20service" \
  -H "Authorization: Bearer <jeton>"

# Affecter un équipement à un utilisateur
curl -X POST http://localhost:3000/api/affectations \
  -H "Authorization: Bearer <jeton>" -H "Content-Type: application/json" \
  -d '{"equipementId":4,"userId":2,"commentaire":"Nouvel arrivant"}'

# Retour matériel (clôture de l'affectation)
curl -X PATCH http://localhost:3000/api/affectations/12/retour \
  -H "Authorization: Bearer <jeton>"

# Installer une licence sur un équipement
curl -X POST http://localhost:3000/api/equipements/4/logiciels \
  -H "Authorization: Bearer <jeton>" -H "Content-Type: application/json" \
  -d '{"logicielId":1}'
```

