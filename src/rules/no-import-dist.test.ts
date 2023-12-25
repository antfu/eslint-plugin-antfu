import { RuleTester } from '../../vendor/rule-tester/src/RuleTester'
import rule, { RULE_NAME } from './no-import-dist'

const valids = [
  'import xxx from "a"',
  'import "b"',
  'import "floating-vue/dist/foo.css"',
]

const invalids = [
  'import a from "../dist/a"',
  'import "../dist/b"',
  'import b from \'dist\'',
  'import c from \'./dist\'',
]

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
})

ruleTester.run(RULE_NAME, rule as any, {
  valid: valids,
  invalid: invalids.map(i => ({
    code: i,
    errors: [{ messageId: 'noImportDist' }],
  })),
})
