import tsParser from '@typescript-eslint/parser'
import type { RuleTesterInitOptions, TestCasesOptions } from 'eslint-vitest-rule-tester'
import { run as _run } from 'eslint-vitest-rule-tester'

export function run(options: TestCasesOptions & RuleTesterInitOptions) {
  return _run({
    parser: tsParser as any,
    ...options,
  })
}
