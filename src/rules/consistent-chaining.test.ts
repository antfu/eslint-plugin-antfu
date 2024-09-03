import { expect } from 'vitest'
import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import { unindent as $ } from 'eslint-vitest-rule-tester'
import rule, { RULE_NAME } from './consistent-chaining'
import { run } from './_test'

const valids: ValidTestCase[] = [
  'foo().bar().baz()[1].dar',
  'foo().bar.baz().boo()',
  $`
    foo()
      .bar
      .baz()
      .boo()
  `,
]

// Check snapshot for fixed code
const invalid: InvalidTestCase[] = [
  {
    code: $`
      foo().bar
        .baz()
        .boo()
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`"foo().bar.baz().boo()"`),
  },
  {
    code: $`
      foo({
        bar: true
      }).bar
        .baz()
        .boo()
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "foo({
          bar: true
        }).bar.baz().boo()"
      `),
  },
  {
    code: $`
      foo({
        bar: true
      })
        .bar
        .baz().boo()
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "foo({
          bar: true
        })
          .bar
          .baz()
        .boo()"
      `),
  },
  {
    code: $`
      foo({
        bar: true
      })[1]
      .bar
        .baz[1]().boo.bar()
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "foo({
          bar: true
        })[1]
        .bar
          .baz[1]()
        .boo
        .bar()"
      `),
  },
]

run({
  name: RULE_NAME,
  rule,

  valid: valids,
  invalid: invalid.map((i): InvalidTestCase =>
    typeof i === 'string'
      ? {
          code: i,
          output: o => expect(o).toMatchSnapshot(),
        }
      : i,
  ),
})
