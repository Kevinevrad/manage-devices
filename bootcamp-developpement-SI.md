# Bootcamp — Processus de développement d'un Système d'Information (SI)

> Objectif : comprendre et pratiquer, de bout en bout, les étapes qui mènent d'un besoin métier à un SI en production — utile aussi bien pour cadrer une mission client que pour piloter un projet interne.
> Format : 6 modules, chacun avec théorie courte + livrable pratique. Tu peux dérouler 1 module par semaine, ou plus vite si tu es déjà à l'aise sur certaines parties.

---

## Module 0 — Vue d'ensemble (30 min)

### Qu'est-ce qu'un SI ?
Un système d'information, ce n'est pas juste "l'application". C'est l'ensemble : processus métier + données + acteurs + technologie qui les fait fonctionner ensemble. Coder une app sans avoir modélisé le SI derrière, c'est construire une maison sans plan.

### Les grandes méthodologies
| Méthode | Logique | Quand l'utiliser |
|---|---|---|
| **Cycle en V** | Séquentiel, chaque étape validée avant la suivante | Cahier des charges figé, contexte réglementaire (banque, santé, marchés publics) |
| **Agile / Scrum** | Itératif, livraisons courtes (sprints) | Besoin évolutif, client disponible, produit qui se découvre en marchant |
| **Merise** (héritage français) | Séparation données / traitements, formalisme MCD-MLD-MPD | Projets SI "gestion" en France/Afrique francophone, fort ancrage dans le monde des SSII |

Dans la réalité, la plupart des missions clients mélangent : cadrage type cycle en V (on ne peut pas facturer sans périmètre clair), puis développement en sprints agiles.

**Livrable module 0** : aucun, c'est la mise en contexte.

---

## Module 1 — Étude préalable & cadrage (Semaine 1)

C'est l'étape où la moitié des projets se plantent — pas par manque de code, mais par manque de cadrage. Tu as déjà pratiqué cet exercice sur le projet FileZilla, donc les réflexes doivent te parler.

### Ce qu'on produit
1. **Expression de besoin** — ce que le client dit vouloir (souvent flou, parfois contradictoire)
2. **Étude d'opportunité** — est-ce que ça vaut le coup ? (existant, alternatives, coût estimé, ROI)
3. **Périmètre (scope)** — ce qui est dedans / ce qui est dehors, explicitement
4. **Cahier des charges fonctionnel** — les fonctionnalités attendues, formulées côté métier, pas technique
5. **Contraintes** — budget, délai, techniques (hébergement imposé ?), réglementaires (RGPD si data perso)

### Questions à toujours poser au client
- Qui sont les utilisateurs finaux, et combien sont-ils ?
- Quel processus métier existe aujourd'hui (même à la main, sur Excel) ?
- Quelle est la douleur principale que ça doit résoudre ?
- Qui décide si c'est "terminé" ?

### Exercice pratique
Prends un projet que tu connais bien — par exemple ton **SaaS de gestion de parc informatique** — et rédige :
- une expression de besoin en 10 lignes maximum, écrite comme si c'était le client qui parlait
- un tableau "dans le périmètre / hors périmètre" pour la V1

**Livrable module 1** : cahier des charges fonctionnel (1-2 pages) du projet que tu choisis.

---

## Module 2 — Analyse fonctionnelle (Semaine 2)

On transforme le besoin flou en spécifications précises et modélisables.

### Outils clés
- **Diagrammes de cas d'utilisation (UML use case)** — qui fait quoi avec le système
- **User stories** (si tu pars plutôt agile) : *"En tant que [rôle], je veux [action] afin de [bénéfice]"*
- **MCD (Modèle Conceptuel de Données)** — méthode Merise, entités/associations, indépendant de toute techno
- **Matrice des règles de gestion** — les règles métier non négociables ("un actif ne peut être affecté qu'à un seul utilisateur à la fois")

### Le piège à éviter
Ne pas mélanger analyse fonctionnelle (ce que le système doit faire) et conception technique (comment il le fait). Beaucoup de devs sautent cette étape et arrivent direct à la base de données — ça marche sur un petit projet, ça explose sur un projet multi-acteurs comme ton SaaS multi-entreprises.

### Exercice pratique
Sur ton projet de gestion de parc informatique :
- liste 5 acteurs (admin entreprise, technicien, utilisateur final, super-admin SaaS...)
- pour chaque acteur, 3 cas d'usage principaux
- un MCD simplifié (entités : Entreprise, Utilisateur, Actif, Abonnement...)

**Livrable module 2** : diagramme de cas d'utilisation + MCD.

---

## Module 3 — Conception (Semaine 3)

On passe du "quoi" au "comment".

### Conception des données
MCD → **MLD** (Modèle Logique de Données, avec clés étrangères) → **MPD** (Modèle Physique, propre au SGBD choisi : PostgreSQL, MySQL...).

### Conception applicative
- Architecture générale : monolithe vs microservices, API REST vs GraphQL
- Découpage en couches : présentation / métier / accès aux données
- Choix techniques justifiés (pas "parce que je connais React", mais "parce que le besoin est X donc React+TS+Vite convient")
- Sur un multi-tenant comme ton SaaS : isolation des données par entreprise (schema séparé ? colonne `entreprise_id` partout ? approche à trancher tôt, ça coûte cher à changer après coup)

### Conception UI/UX
- Wireframes basse fidélité avant maquettes
- Parcours utilisateur (user flow) pour les actions critiques
- Design system si le projet est amené à grossir

### Exercice pratique
- Passe ton MCD en MLD (ajoute les clés étrangères, les cardinalités traduites)
- Décide : mono-schéma avec `entreprise_id` ou schéma par tenant ? Justifie en 3 lignes.
- Wireframe (même à la main / Figma rapide) de l'écran principal (dashboard parc informatique)

**Livrable module 3** : MLD + décision d'architecture documentée + wireframe.

---

## Module 4 — Réalisation / Développement (Semaine 4-5)

C'est la partie où tu es déjà solide (React, TS, Vite, Tailwind, Feature-Sliced Design). L'objectif du bootcamp ici n'est pas de te réapprendre à coder, mais de structurer *comment* on développe un SI proprement.

### Bonnes pratiques process
- **Découpage en lots/sprints** — livrer un périmètre fonctionnel cohérent, pas "50% de tout"
- **Versioning et branches** — convention claire (feature/, fix/, release/)
- **Environnements séparés** — dev / staging / prod, jamais coder directement en prod
- **Revue de code** — même seul, se relire à froid le lendemain change beaucoup
- **Documentation au fil de l'eau** — pas à la fin, ou elle ne se fera jamais

### Spécifique multi-tenant / SaaS
- Authentification & autorisation (rôles : super-admin SaaS, admin entreprise, utilisateur)
- Gestion des abonnements (statuts, périodes d'essai, passage à l'échelle)
- Migrations de base de données versionnées

**Livrable module 4** : squelette technique du projet (repo initialisé, architecture Feature-Sliced en place, premier module fonctionnel — ex. gestion des actifs).

---

## Module 5 — Tests & Recette (Semaine 6)

### Les niveaux de test
| Niveau | Qui teste | Quoi |
|---|---|---|
| Tests unitaires | Dev | Une fonction, un composant isolé |
| Tests d'intégration | Dev | Plusieurs modules ensemble (ex. API + DB) |
| Tests fonctionnels / recette | Client ou métier | Le système répond-il au cahier des charges ? |
| Tests de charge | QA/Dev | Comportement sous forte utilisation (critique pour un SaaS multi-clients) |

### Recette : cahier de recette
Reprendre chaque fonctionnalité du cahier des charges (module 1) et vérifier, avec le client si possible, qu'elle est bien couverte. C'est le moment où on referme la boucle avec le besoin initial.

**Livrable module 5** : cahier de recette avec au moins 10 scénarios de test pour le module développé en M4.

---

## Module 6 — Déploiement & Maintenance (Semaine 7)

### Déploiement
- Choix d'hébergement (VPS, PaaS type Vercel/Railway, cloud)
- CI/CD — automatiser build/test/déploiement
- Stratégie de mise en production (déploiement progressif, rollback possible)

### Maintenance
- **Corrective** — bugs post-prod
- **Évolutive** — nouvelles fonctionnalités
- **Préventive** — mises à jour de dépendances, sécurité
- Monitoring & logs — savoir qu'un problème existe avant que le client ne le signale

**Livrable module 6** : pipeline CI/CD basique (même minimal) + plan de maintenance en 5 lignes (qui, quoi, quelle fréquence).

---

## Récapitulatif du parcours

```
Cadrage (M1) → Analyse (M2) → Conception (M3) → Réalisation (M4) → Tests (M5) → Déploiement (M6)
     ↑                                                                              |
     └──────────────────────── boucle de maintenance / évolution ───────────────────┘
```

## Comment utiliser ce bootcamp
Le plus efficace : appliquer chaque module directement sur ton projet de **SaaS de gestion de parc informatique**, puisqu'il est déjà en cours de conception chez toi. Ça te donne un cas réel plutôt qu'un exercice abstrait, et à la fin tu as à la fois la méthode et un vrai projet avancé.

Dis-moi si tu veux qu'on démarre le Module 1 ensemble tout de suite, en l'appliquant concrètement à ce projet.
