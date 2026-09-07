# Manage Devices — Gestion de parc informatique

Application de gestion de parc informatique : inventaire des équipements, licences logicielles (suivi des sièges), affectations du matériel aux utilisateurs avec historique, et dashboard de synthèse.

| Application | Stack |
|---|---|
| `backend/` | Node.js, Express 5, TypeScript, Prisma 7 (SQLite via `better-sqlite3`), JWT + bcrypt |
| `frontend/` | React 19, TypeScript, Vite, TanStack Router + TanStack Query, Tailwind CSS 4, shadcn |

```
manage-device/
├── backend/          API REST — architecture routes → controllers → services → Prisma
│   ├── prisma/       Schéma (multi-fichiers), migrations, seed
│   └── tests/        Tests d'intégration (Vitest + Supertest)
├── frontend/         SPA — routing typé, données réelles via l'API
└── docs/API.md       Référence complète de l'API
```

## Démarrage rapide

### Prérequis
- Node.js ≥ 20, npm ≥ 10

### 1. Backend (API sur http://localhost:3000)

```bash
cd backend
npm install
copy .env.example .env      # Windows (cp sous Linux/macOS) puis adaptez si besoin
npm run db:deploy           # crée la base SQLite + applique les migrations
npm run db:seed             # jeu de données de démonstration
npm run dev                 # démarrage avec rechargement automatique
```

### 2. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev                 # le proxy Vite relaie /api vers le backend (port 3000)
```

Ouvrez http://localhost:5173 — la redirection vers `/login` demande une session.

### Comptes de démonstration

Créés par `npm run db:seed`, tous avec le mot de passe **`Password123!`** :

| E-mail | Rôle | Service |
|---|---|---|
| `kevin.assoko@infratp.com` | admin | Informatique |
| `marc.lefevre@infratp.com` | technicien | Logistique |
| `awa.diallo@infratp.com` | user | Comptabilité |
| `sarah.benali@infratp.com` | user | Commercial |
| `hugo.petit@infratp.com` | user | Marketing |

## Scripts utiles

### Backend

| Script | Rôle |
|---|---|
| `npm run dev` | API en mode watch (tsx) |
| `npm start` | API sans watch |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm test` | Tests d'intégration (base jetable `prisma/test.db`) |
| `npm run db:deploy` | Applique les migrations |
| `npm run db:seed` | Réinitialise et recharge les données de démo |
| `npm run db:studio` | Explorateur Prisma Studio |

### Frontend

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur Vite (HMR) |
| `npm run build` | Typecheck + build de production (`dist/`) |
| `npm run lint` | ESLint |

## Authentification & sécurité

- Sessions **JWT** (`Authorization: Bearer <jeton>`, durée par défaut 7 jours — `JWT_EXPIRE_IN`).
- Inscription publique : le rôle est **forcé à `user`** ; mot de passe **hashé bcrypt** (jamais renvoyé par l'API).
- Toutes les routes métier exigent un jeton valide ; `DELETE /api/users/:id` est réservé aux **admins**.
- Le secret est défini par `JWT_SECRET` (backend/.env) — **à changer impérativement en production**.
- En-têtes de sécurité **helmet** sur toutes les réponses (`X-Content-Type-Options`, `X-Frame-Options`, HSTS…).
- **CORS restrictif** : seules les origines listées dans `CORS_ORIGIN` (backend/.env, séparées par des virgules) reçoivent les en-têtes d'autorisation — défaut : `http://localhost:5173`.
- **Isolation par tenant** : le JWT embarque l'organisation ; `admin` = accès global, tout autre rôle avec organisation est cloisonné à ses données (404 hors tenant, créations rattachées automatiquement).

## Règles métier principales

- **Affectations** : affecter un équipement clôture automatiquement l'affectation ouverte précédente et passe le matériel « En service » ; le retour le détache et le repasse « En stock ».
- **Licences** : chaque installation occupe un siège ; au-delà de `siegesTotal`, l'installation est refusée (409). Une licence perpétuelle n'a ni échéance ni coût annuel.
- **Unicités** : n° de série d'équipement, clé de licence, e-mail utilisateur (409 en cas de conflit).
- **Statuts d'équipement** : Non Affecté · En service · En stock · En panne · Rebut.

## Tests

```bash
cd backend
npm test          # 36 tests d'intégration : auth, équipements, affectations, licences
npm run typecheck
```

Chaque exécution part d'une base neuve (`prisma/test.db`, recréée par les migrations) — la base de développement n'est jamais touchée.

## Déploiement

- **Frontend** : GitHub Actions déploie automatiquement `dist/` sur **GitHub Pages** à chaque push sur `main` (voir `frontend/.github/workflows`). En production, définir `VITE_API_URL` avec l'URL publique de l'API.
- **Backend** : à héberger (VPS, PaaS…) avec `DATABASE_URL` et `JWT_SECRET` forts ; `npm run db:deploy` applique les migrations.

## État d'avancement

- ✅ API CRUD complète (équipements, logiciels, utilisateurs, affectations) + authentification JWT
- ✅ Multi-tenant : modèle Organisation (mono-schéma), rattachement/filtrage des entités, CRUD admin
- ✅ Enums métier (statut équipement, rôle, type de licence) avec mapping libellés français ↔ valeurs stockées
- ✅ Frontend branché sur l'API : dashboard, équipements, licences, affectations (états chargement/erreur)
- ✅ Login / register fonctionnels, gardes de routes, déconnexion
- ✅ Tests d'intégration backend (55 tests)
- ✅ Créations et mutations depuis l'UI : ajout d'équipement, ajout de licence, nouvelle affectation et retour du matériel (toasts + invalidation TanStack Query)
- ✅ Édition des équipements et suppression (équipements, licences) depuis les menus d'actions des tables
- ✅ Graphiques du dashboard sur données réelles (répartition par statut, tendance des affectations sur 6 mois)
- ⬜ Export de données et rapports
- ✅ Isolation stricte par tenant (JWT enrichi, cloisonnement des listes et des accès par id, anti-IDOR)
