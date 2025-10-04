import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['**/dist/*', '**/node_modules/*', '**/lib/*'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'eqeqeq': 2,
      'no-extra-semi': 2,
      'no-var': 2,
      'quote-props': [2, 'as-needed'],
      'quotes': [2, 'single'],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'eqeqeq': 2,
      'no-extra-semi': 2,
      'no-var': 2,
      'quote-props': [2, 'as-needed'],
      'quotes': [2, 'single'],
    },
  },
];
