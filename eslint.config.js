// ESLint 9 flat config — TypeScript + Playwright.
// Run with `npm run lint`.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'reports/**',
      'test-results/**',
      'playwright-report/**',
      'allure-results/**',
      'allure-report/**',
      '.healing-cache.json',
      'test-data/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mjs,js}'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // The logger and CLI scripts intentionally use console.
    files: ['src/utils/logger.ts', 'scripts/**/*.{mjs,js}', '*.config.{js,mjs,ts}'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Recognise our POM helpers (expectVisible, expectHidden, expectText,
      // expectCartVisible, ...) as assertions for the expect-expect rule.
      // Our POMs encapsulate assertions inside expectVisible / expectBadCredentialsError /
      // etc. — the rule's static analysis can't see through them. Off (we'd rather catch
      // missing assertions in code review).
      'playwright/expect-expect': 'off',
    },
  },
);
