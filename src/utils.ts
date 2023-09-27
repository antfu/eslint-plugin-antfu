import { ESLintUtils } from '@typescript-eslint/utils'

const hasDocs = [
  'consistent-list-newline',
  'if-newline',
  'import-dedupe',
  'top-level-function',
]

const blobUrl = 'https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/'

export const createEslintRule = ESLintUtils.RuleCreator(
  ruleName => hasDocs.includes(ruleName)
    ? `${blobUrl}${ruleName}.md`
    : `${blobUrl}${ruleName}.test.ts`,
)
