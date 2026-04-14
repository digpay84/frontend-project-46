import stylistic from '@stylistic/eslint-plugin'

export default [
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quote-props': ['error', 'consistent-as-needed'],
    },
  },
]
