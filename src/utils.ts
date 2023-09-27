import { ESLintUtils } from '@typescript-eslint/utils'

const hasDocs = ['consistent-list-newline']

export const createEslintRule = ESLintUtils.RuleCreator(
  ruleName => hasDocs.includes(ruleName)
    ? `https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/${ruleName}.md`
    : `https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/${ruleName}.test.ts`,
)
