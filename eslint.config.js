import globals from 'globals'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      indent: ['error', 2],
      'no-unused-vars': 'warn',
      semi: ['error', 'never'],
    },
  },
]
