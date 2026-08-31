import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Primitives shadcn/ui : elles exportent volontairement des variantes
    // (badgeVariants, buttonVariants, tabsListVariants) et des hooks
    // (useSidebar) à côté des composants — pattern officiel shadcn.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Routes TanStack : le file-based routing impose l'export `Route` de
    // createFileRoute dans le même fichier que le composant de page (et ce
    // composant a besoin de hooks : useSearch, useNavigate…). La règle
    // fast-refresh est donc désactivée pour ce dossier uniquement.
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
