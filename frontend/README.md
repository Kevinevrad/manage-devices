# Manage Devices — Frontend

SPA de gestion de parc informatique (React 19 + TypeScript + Vite). Se connecte à l'API du dossier `../backend` — voir le [README racine](../README.md) pour l'installation complète.

## Scripts

```bash
npm install
npm run dev       # http://localhost:5173 (proxy /api → http://localhost:3000)
npm run build     # typecheck + build de production
npm run lint      # ESLint
npm run preview   # sert le build de production
```

## Stack

- **React 19** + **Vite 8**
- **TanStack Router** : routing par fichiers, typé, code-splitting automatique, gardes de session (`beforeLoad`)
- **TanStack Query** : cache serveur, états de chargement/erreur
- **Tailwind CSS 4** + composants shadcn (`components/ui`)
- Tabler Icons, Recharts, sonner

## Organisation

```
src/
├── components/      UI réutilisable (layout, tables, formulaires, sections, ui/)
├── data/            Données de démonstration restantes (graphiques du dashboard)
├── hooks/           api.ts (requêtes TanStack Query), auth.tsx (session)
├── lib/             api.ts (client HTTP + JWT), mappers.ts, stats.ts, format.ts
├── routes/          Pages (dashboard, équipements, licences, affectations, login, register)
├── types/           api.ts (types miroir des DTO du backend)
└── styles/          Tailwind + thème
```

## Configuration

- **Développement** : rien à faire, le proxy Vite relaie `/api` vers `http://localhost:3000` (voir `vite.config.ts`).
- **Production** : copier `.env.example` en `.env` et définir `VITE_API_URL` avec l'URL publique de l'API.
