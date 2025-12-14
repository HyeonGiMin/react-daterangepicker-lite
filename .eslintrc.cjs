/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': 'warn'
  },
  ignorePatterns: ['dist', 'node_modules']
};
