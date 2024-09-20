import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import { unindent as $ } from 'eslint-vitest-rule-tester'
import { expect } from 'vitest'
import { run } from './_test'
import rule, { RULE_NAME } from './consistent-chaining'

const valids: ValidTestCase[] = [
  'foo().bar().baz()[1].dar',
  'foo().bar.baz().boo()',
  $`
    foo()
      .bar
      .baz()
      .boo()
  `,
  $`
    Math.random()
      .toString()
      .split('')
      .map(Number)
  `,
  $`
    foo.bar.baz()
      .toString()
      .split('')
      .map(Number)
  `,
  $`
    foo.bar.baz
      .toString()
      .split('')
      .map(Number)
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
  {
    code: $`
      Math.random()
        .toString()
        .split('').map(Number)
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "Math.random()
          .toString()
          .split('')
        .map(Number)"
      `),
  },
  {
    code: $`
      this.foo
        .toString()
        .split('').map(Number)
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "this.foo
          .toString()
          .split('')
        .map(Number)"
      `),
  },
  {
    code: $`
      Math
        .random() .toString() .split('').map(Number)
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "Math
          .random()
         .toString()
         .split('')
        .map(Number)"
      `),
  },
  {
    code: $`
      [foo].map(x => x)
        .filter(x => x)
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`"[foo].map(x => x).filter(x => x)"`),
  },
  {
    code: $`
      [foo]
        .map(x => x).filter(x => x)
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "[foo]
          .map(x => x)
        .filter(x => x)"
      `),
  },
  {
    code: $`
      foo.bar.bar
        .filter().map()
    `,
    output: o => expect(o)
      .toMatchInlineSnapshot(`
        "foo.bar.bar
          .filter()
        .map()"
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
