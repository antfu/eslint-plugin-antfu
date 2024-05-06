import tsParser from '@typescript-eslint/parser'
import type { RuleTesterOptions } from 'eslint-vitest-rule-tester'
import { createRuleTester as createRuleTesterOriginal } from 'eslint-vitest-rule-tester'

export function createRuleTester(options: RuleTesterOptions) {
  return createRuleTesterOriginal({
    ...options,
    configs: [
      {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
          parser: tsParser as any,
        },
      },
      ...toArray(options.configs || []),
    ],
  })
}

function toArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value]
}
