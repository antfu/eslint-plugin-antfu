import { unindent as $ } from 'eslint-vitest-rule-tester'
import { run } from './_test'
import rule from './indent-unindent'

run({
  name: 'indent-unindent',
  rule,

  valid: [
    $`
      const a = $\`
        b
      \`
    `,
    $`
      const a = foo\`b\`
    `,
  ],
  invalid: [
    {
      code: $`
        const a = {
          foo: $\`
              if (true)
                return 1
          \`
        } 
      `,
      output: $`
        const a = {
          foo: $\`
            if (true)
              return 1
          \`
        } 
      `,
    },
    {
      code: $`
        const a = $\`
            if (true)
              return 1\`
      `,
      output: $`
        const a = $\`
          if (true)
            return 1
        \`
      `,
    },
    {
      description: 'should work with escapes',
      code: $`
        const a = $\`
              \\t\\t\\\`foo\\\`
              \\tbar
        \`
      `,
      output: $`
        const a = $\`
          \\t\\t\\\`foo\\\`
          \\tbar
        \`
      `,
    },
  ],
})
