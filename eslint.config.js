export default [
  {
    ignores: ['**/dist/*', '**/node_modules/*'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2017,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
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
