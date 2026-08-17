import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export function baseConfig({ browser = false, node = false, react = false } = {}) {
  const globalsValue = { ...globals.browser };
  if (node) Object.assign(globalsValue, globals.node);

  const configs = [
    {
      ignores: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'coverage/**',
        'build/**',
        '.turbo/**',
        'next-env.d.ts',
      ],
    },
    ...tseslint.configs.recommended,
    {
      languageOptions: {
        globals: globalsValue,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
  ];

  if (react) {
    configs.push(
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      {
        settings: {
          react: { version: 'detect' },
        },
        rules: {
          'react/prop-types': 'off',
          'react-hooks/set-state-in-effect': 'off',
          'react-hooks/incompatible-library': 'off',
          'react-hooks/purity': 'off',
          'react-hooks/use-memo': 'off',
        },
      },
    );
  }

  return configs;
}

export default baseConfig;
