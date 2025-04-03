import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactNative from 'eslint-plugin-react-native';
import globals from 'globals';

export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      'react-native': pluginReactNative,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactNative.configs.all.rules,

      'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
