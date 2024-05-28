import { unindent as $ } from 'eslint-vitest-rule-tester'
import { run } from './_test'
import rule, { RULE_NAME } from './curly'

run({
  name: RULE_NAME,
  rule,
  valid: [
    $`
      if (true)
        console.log('hello')
    `,
    $`
      if (true) {
        console.log('hello')
      }
    `,
    $`
      while (true)
        console.log('bar')
    `,
    $`
      if (true)
        console.log('foo')
      else if (false)
        console.log('bar')
    `,
    $`
      if (true) {
        console.log('foo')
      } else if (false) {
        console.log('bar')
      } else if (true) {
        console.log('baz')
      }
    `,
    $`
      function identity(x) {
        if (foo)
          console.log('bar')
      }
    `,
    $`
      function identity(x) {
        if (foo)
          console.log('bar')
        ;console.log('baz')
      }
    `,
    $`
      function identity(x) {
        if (foo)
          return x;
      }
    `,
  ],
  invalid: [
    {
      description: 'multi',
      code: $`
        if (true)
          console.log({
            foo
          })
      `,
      output: $`
        if (true) {
          console.log({
            foo
          })
        }
      `,
    },
    {
      description: 'nested',
      code: $`
        if (true)
          if (false) console.log('bar')
      `,
      output: $`
        if (true) {
          if (false) console.log('bar')
        }
      `,
    },
    {
      description: 'consistent',
      code: $`
        if (true)
          console.log('bar')
        else
          console.log({
            foo
          })
      `,
      output: $`
        if (true) {
          console.log('bar')
        }
        else {
          console.log({
            foo
          })
        }
      `,
    },
    {
      description: 'while',
      code: $`
        while (true)
          console.log({
            foo
          })
      `,
      output: $`
        while (true) {
          console.log({
            foo
          })
        }
      `,
    },
    {
      description: 'if-else-if',
      code: $`
        if (true)
          console.log('foo')
        else if (false)
          console.log('bar')
        else if (true)
          console.log('baz')
        else {
          console.log('qux')
        }
      `,
      output: $`
        if (true) {
          console.log('foo')
        }
        else if (false) {
          console.log('bar')
        }
        else if (true) {
          console.log('baz')
        }
        else {
          console.log('qux')
        }
      `,
    },
    {
      description: 'multiline-test',
      code: $`
        if (
          foo 
          || bar
        )
          return true
      `,
      output: $`
        if (
          foo 
          || bar
        ) {
          return true
        }
      `,
    },
  ],
})
