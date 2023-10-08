import type { RuleWithMetaAndName } from '@typescript-eslint/utils/eslint-utils'
import { RuleCreator } from '@typescript-eslint/utils/eslint-utils'
import type { Rule } from 'eslint'

const hasDocs = [
  'consistent-list-newline',
  'if-newline',
  'import-dedupe',
  'top-level-function',
]

const blobUrl = 'https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/'

export interface RuleModule<T extends readonly unknown[]> extends Rule.RuleModule {
  defaultOptions: T
}

export const createEslintRule = RuleCreator(
  ruleName => hasDocs.includes(ruleName)
    ? `${blobUrl}${ruleName}.md`
    : `${blobUrl}${ruleName}.test.ts`,
) as any as <TOptions extends readonly unknown[], TMessageIds extends string>({ name, meta, ...rule }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>) => RuleModule<TOptions>
