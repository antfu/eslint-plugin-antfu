import { unindent as $ } from 'eslint-vitest-rule-tester'
import { run } from './_test'
import rule, { RULE_NAME } from './no-top-level-await'

const valids = [
  'async function foo() { await bar() }',
  $`
    const a = async () => {
      await bar()
    }
  `,
]

const invalids = [
  'await foo()',

  $`
    function foo() {
      
    }
    
    await foo()
  `,
  $`
    const a = {
      foo: await bar()
    }
  `,
]

run({
  name: RULE_NAME,
  rule,
  valid: valids,
  invalid: invalids.map(i => ({
    code: i,
    errors: [{ messageId: 'NoTopLevelAwait' }],
  })),
})
