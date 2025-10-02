import globals from 'globals'
import js from '@eslint/js'
import TSESLint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { configs as litConfigs } from 'eslint-plugin-lit'
import stylistic from '@stylistic/eslint-plugin'

export default [
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'] },
  { ignores: ['node_modules'] },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: globals.browser,
      sourceType: 'module',
    },
  },

  litConfigs['flat/recommended'],

  js.configs.recommended,
  // Standard rules overrides
  {
    rules: {
      'comment-capitalized': ['off'],
      'no-empty-pattern': ['off'],
      'no-prototype-builtins': ['warn'],
      'no-unused-private-class-members': ['off'],
      'no-unused-vars': ['off'],
      'no-useless-escape': ['warn'],
      'one-var': ['error', 'never'],
      'prefer-template': ['warn'],
      'template-curly-spacing': ['error', 'never'],
    },
  },

  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['warn', 2, { ignoredNodes: ['TemplateLiteral *'], SwitchCase: 1 }],
      '@stylistic/max-len': ['warn', { code: 120, ignoreUrls: true }],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/template-tag-spacing': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', 'never'],
    },
  },

  ...TSESLint.config(TSESLint.configs.recommendedTypeChecked, TSESLint.configs.stylisticTypeChecked),
  // TypeScript specific configuration
  {
    rules: {
      '@typescript-eslint/no-misused-promises': ['off'],
      '@typescript-eslint/no-empty-object-type': ['off'],
      '@typescript-eslint/no-explicit-any': ['warn'],
      '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: true }],
      '@typescript-eslint/no-unsafe-assignment': ['warn'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        allowDefaultProject: ['*.js'],
        extraFileExtensions: ['.json'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
  },

  // E2E Tests
  {
    files: ['tests/**/*.{js,mjs,cjs,ts}'],
    rules: {
      ...TSESLint.configs.disableTypeChecked.rules,
      'no-undef': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-expressions': ['off'],
    },
    languageOptions: {
      parserOptions: {
        allowDefaultProject: true,
        projectService: false,
      },
    },
  },

  {
    files: ['tests/**/*.spec.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },

  {
    files: ['tests/**/*.cy.{js,mjs,cjs,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['vitest', 'vitest/*'],
              message: 'Vitest imports are not allowed in Cypress test files. Use Cypress testing utilities instead.',
            },
          ],
        },
      ],
    },
  },

  // Prettier override
  eslintConfigPrettier,
]
