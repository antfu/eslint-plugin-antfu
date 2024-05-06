import { createRuleTester } from './_test'
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

const ruleTester = createRuleTester({
  name: RULE_NAME,
  rule,
})

ruleTester.run({
  valid: valids,
  invalid: invalids.map(i => ({
    code: i,
    errors: [{ messageId: 'noImportDist' }],
  })),
})
