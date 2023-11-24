import { RuleTester } from '../../vendor/rule-tester/src/RuleTester'
import rule, { RULE_NAME } from './indent-binary-ops'

const valids = [
`type a = {
  [K in keyof T]: T[K] extends Date
    ? Date | string
    : T[K] extends (Date | null)
      ? Date | string | null
      : T[K];
}`,
`type Foo =
  | A
`,
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
`
  function isNamedFunction(node:
  | Tree.ArrowFunctionExpression
  | Tree.FunctionDeclaration
  | Tree.FunctionExpression,
  ) {
    if (node.id)
      return true

    const parent = node.parent

    return parent.type === 'MethodDefinition'
              || (parent.type === 'Property'
                  && (
                    parent.kind === 'get'
                      || parent.kind === 'set'
                      || parent.method
                  )
              )
  }
`,
`type Foo = A | B
| C | D
  | E`,

`type Foo = 
  | A | C
    | B
`,
`type T = 
  a 
  | b 
    | c`,
`type T =
& A
  & (B
  | A
  | D)`,
` 
function TSPropertySignatureToProperty(
  node: 
  | TSESTree.TSEnumMember
    | TSESTree.TSPropertySignature
  | TSESTree.TypeElement,
  type: 
  | AST_NODE_TYPES.Property
    | AST_NODE_TYPES.PropertyDefinition = AST_NODE_TYPES.Property,
): TSESTree.Node | null {}`,
`
type Foo = Merge<
    A 
  & B
    & C
>`,
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
