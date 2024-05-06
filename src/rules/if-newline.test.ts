import { createRuleTester } from './_test'
import rule, { RULE_NAME } from './if-newline'

const valids = [
  `if (true)
  console.log('hello')
`,
  `if (true) {
  console.log('hello')
}`,
]
const invalids = [
  ['if (true) console.log(\'hello\')', 'if (true) \nconsole.log(\'hello\')'],
]

const ruleTester = createRuleTester({
  name: RULE_NAME,
  rule,
})

ruleTester.run({
  valid: valids,
  invalid: invalids.map(i => ({
    code: i[0],
    output: i[1],
    errors: [{ messageId: 'missingIfNewline' }],
  })),
})
