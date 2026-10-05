import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Qatlamlar orasidagi import qoidalari (README → Qoidalar).
const deepFeatureImport = {
  group: ['@/features/*/*'],
  message: "Feature'ning ichiga kirmang — uning index.ts faylidan import qiling.",
}
const upwardImport = {
  group: ['@/app', '@/app/*', '@/pages', '@/pages/*', '@/features', '@/features/*'],
  message: "shared/ yuqori qatlamlarni (app, pages, features) import qilmaydi.",
}

export default defineConfig([
  globalIgnores(['dist', 'src/shared/api/types.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: [deepFeatureImport] }],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [deepFeatureImport, upwardImport] }],
    },
  },
])
