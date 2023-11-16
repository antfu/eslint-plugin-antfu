import { RuleTester } from '../../vendor/rule-tester/src/RuleTester'
import rule, { RULE_NAME } from './indent-binary-ops'

const valids = [
  '',
]
const invalids = [
`
if (
  a && (
    a.b ||
    a.c
  ) &&
  a.d
) {}
`,
`
const a = 
x +
   y * z
`,
`
if (
  aaaaaa >
bbbbb
) {}
`,
`
function foo() {
  if (a 
  || b 
      || c || d
        || (d && b)
  ) {
    foo()
  }
}
`,
]

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
})

ruleTester.run(RULE_NAME, rule as any, {
  valid: valids,
  invalid: invalids.map(i => ({
    code: i,
    errors: null,
    onOutput: (output: string) => {
      expect(output).toMatchSnapshot()
    },
  })),
})
