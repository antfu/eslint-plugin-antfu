import { expect } from 'vitest'
import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import { unindent as $ } from 'eslint-vitest-rule-tester'
import rule, { RULE_NAME } from './consistent-list-newline'
import { run } from './_test'

const valids: ValidTestCase[] = [
  'const a = { foo: "bar", bar: 2 }',
  'const a = {\nfoo: "bar",\nbar: 2\n}',
  'const a = [1, 2, 3]',
  'const a = [\n1,\n2,\n3\n]',
  'import { foo, bar } from "foo"',
  'import {\nfoo,\nbar\n} from "foo"',
  'const a = [`\n\n`, `\n\n`]',
  'log(a, b)',
  'log(\na,\nb\n)',
  'function foo(a, b) {}',
  'function foo(\na,\nb\n) {}',
  'const foo = (a, b) => {\n\n}',
  'const foo = (a, b): {a:b} => {\n\n}',
  'interface Foo { a: 1, b: 2 }',
  'interface Foo {\na: 1\nb: 2\n}',
  'a\n.filter(items => {\n\n})',
  'new Foo(a, b)',
  'new Foo(\na,\nb\n)',
  'function foo<T = {\na: 1,\nb: 2\n}>(a, b) {}',
  'foo(() =>\nbar())',
  'foo(() =>\nbar()\n)',
  `call<{\nfoo: 'bar'\n}>('')`,
  $`
    (Object.keys(options) as KeysOptions[])
    .forEach((key) => {
      if (options[key] === false)
        delete listenser[key]
    })
  `,
  // https://github.com/antfu/eslint-plugin-antfu/issues/11
  `function fn({ foo, bar }: {\nfoo: 'foo'\nbar: 'bar'\n}) {}`,
  {
    code: 'foo(\na, b\n)',
    options: [{ CallExpression: false }],
  },
  // https://github.com/antfu/eslint-plugin-antfu/issues/14
  {
    code: $`
      const a = (
        <div>
          {text.map((item, index) => (
            <p>
            </p>
          ))}
        </div>
      )
    `,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  // https://github.com/antfu/eslint-plugin-antfu/issues/15
  $`
    export const getTodoList = request.post<
      Params,
      ResponseData,
    >('/api/todo-list')
  `,
  // https://github.com/antfu/eslint-plugin-antfu/issues/16
  {
    code: $`
      function TodoList() {
        const { data, isLoading } = useSwrInfinite(
          (page) => ['/api/todo/list', { page }],
          ([, params]) => getToDoList(params),
        )
        return <div></div>
      }
    `,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  $`
    bar(
      foo => foo
        ? ''
        : ''
    )
  `,
  $`
    bar(
      (ruleName, foo) => foo
        ? ''
        : ''
    )
  `,
  // https://github.com/antfu/eslint-plugin-antfu/issues/19
  $`
    const a = [
      (1),
      (2)
    ];
  `,
  `const a = [(1), (2)];`,
  {
    code: $`
      function Foo() {
        return (
          <div 
            className="text-white" onClick="bar"
            style={{
              color: 'red' 
            }}
          >
            hi
          </div>
        );
      }
    `,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
]

// Check snapshot for fixed code
const invalid: InvalidTestCase[] = [
  'const a = {\nfoo: "bar", bar: 2 }',
  'const a = {foo: "bar", \nbar: 2\n}',
  'const a = [\n1, 2, 3]',
  'const a = [1, \n2, 3\n]',
  'import {\nfoo, bar } from "foo"',
  'import { foo, \nbar } from "foo"',
  'log(\na, b)',
  'function foo(\na, b) {}',
  'const foo = (\na, b) => {}',
  'const foo = (\na, b): {\na:b} => {}',
  'const foo = (\na, b): {a:b} => {}',
  'interface Foo {\na: 1,b: 2\n}',
  {
    description: 'Add delimiter to avoid syntax error, (interface)',
    code: 'interface Foo {a: 1\nb: 2\n}',
    output: o => expect(o)
      .toMatchInlineSnapshot(`"interface Foo {a: 1,b: 2,}"`),
  },
  {
    description: 'Add delimiter to avoid syntax error, (type)',
    code: 'type Foo = {a: 1\nb: 2\n}',
    output: o => expect(o)
      .toMatchInlineSnapshot(`"type Foo = {a: 1,b: 2,}"`),
    only: true,
  },
  {
    description: 'Delimiter already exists',
    code: 'interface Foo {a: 1;\nb: 2,\nc: 3}',
    output: o => expect(o)
      .toMatchInlineSnapshot(`"interface Foo {a: 1;b: 2,c: 3}"`),
  },
  'type Foo = {\na: 1,b: 2\n}',
  'type Foo = [1,2,\n3]',
  'new Foo(1,2,\n3)',
  'new Foo(\n1,2,\n3)',
  'foo(\n()=>bar(),\n()=>\nbaz())',
  'foo(()=>bar(),\n()=>\nbaz())',
  'foo<X,\nY>(1, 2)',
  'foo<\nX,Y>(\n1, 2)',
  'function foo<\nX,Y>() {}',
  'const {a,\nb\n} = c',
  'const [\na,b] = c',
  'foo(([\na,b]) => {})',

  {
    description: 'CRLF',
    code: 'const a = {foo: "bar", \r\nbar: 2\r\n}',
    output: o => expect(o.replace(/\r/g, '\\r'))
      .toMatchInlineSnapshot(`"const a = {foo: "bar", bar: 2}"`),
  },
  // https://github.com/antfu/eslint-plugin-antfu/issues/14
  {
    code: $`
      const a = (
        <div>
          {text.map((
            item, index) => (
            <p>
            </p>
          ))}
        </div>
      )
    `,
    output: o => expect(o).toMatchInlineSnapshot(`
      "const a = (
        <div>
          {text.map((
            item, 
      index
      ) => (
            <p>
            </p>
          ))}
        </div>
      )"
    `),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  // https://github.com/antfu/eslint-plugin-antfu/issues/18
  {
    code: $`
      export default antfu({
      },
      {
        foo: 'bar'
      }
        // some comment
        // hello
      )
    `,
    output: o => expect(o).toMatchInlineSnapshot(`
      "export default antfu({
      },{
        foo: 'bar'
      }
        // some comment
        // hello
      )"
    `),
  },
  {
    code: $`
      function Foo() {
        return (
          <div className="text-white"
            onClick="bar"
            style={{ color: 'red' }}
          >
            hi
          </div>
        );
      }
    `,
    output: o => expect(o).toMatchInlineSnapshot(`
      "function Foo() {
        return (
          <div className="text-white"      onClick="bar"      style={{ color: 'red' }}    >
            hi
          </div>
        );
      }"
    `),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  {
    code: $`
      function Foo() {
        return (
          <div 
            className="text-white" onClick="bar"
            style={{ color: 'red' }}
          >
            hi
          </div>
        );
      }
    `,
    output: o => expect(o).toMatchInlineSnapshot(`
      "function Foo() {
        return (
          <div 
            className="text-white" 
      onClick="bar"
            style={{ color: 'red' }}
          >
            hi
          </div>
        );
      }"
    `),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  // https://github.com/antfu/eslint-plugin-antfu/issues/18
  {
    code: $`
      export default antfu({
      },
      // some comment
      {
        foo: 'bar'
      },
      {
      }
        // hello
      )
    `,
    output: o => expect(o).toMatchInlineSnapshot(`
      "export default antfu({
      },
      // some comment
      {
        foo: 'bar'
      },{
      }
        // hello
      )"
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
