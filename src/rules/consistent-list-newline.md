# consistent-list-newline

Enforce consistent line breaks inside braces of object/array/named imports/exports and function parameters.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
const foo = {
  bar: 'baz', qux: 'quux',
  fez: 'fum'
}
```

<!-- eslint-skip -->
```js
// 👍 good
const foo = {
  bar: 'baz',
  qux: 'quux',
  fez: 'fum'
}

// 👍 good
const foo = { bar: 'baz', qux: 'quux', fez: 'fum' }
```

It will check the newline style of the **first** property or item and apply to the rest of the properties or items. So you can also use this rule to quite wrap / unwrap your code.

## Options

Every node type the rule handles can be individually disabled. Set a key to `false` to opt out of checking that node type. By default, all are enabled.

```ts
export default {
  rules: {
    'antfu/consistent-list-newline': ['error', {
      ObjectExpression: false, // don't check object literals
    }],
  },
}
```

| Option                         | Example                                |
| ------------------------------ | -------------------------------------- |
| `ArrayExpression`              | `[a, b, c]`                            |
| `ArrayPattern`                 | `const [a, b] = arr`                   |
| `ArrowFunctionExpression`      | `(a, b) => …` (only when >1 param)     |
| `CallExpression`               | `fn(a, b, c)`                          |
| `ExportNamedDeclaration`       | `export { a, b } from '…'`             |
| `FunctionDeclaration`          | `function f(a, b) {}`                  |
| `FunctionExpression`           | `function (a, b) {}`                   |
| `IfStatement`                  | `if (a)` / `if (a, b)`                 |
| `ImportDeclaration`            | `import { a, b } from '…'`             |
| `JSONArrayExpression`          | JSON array literals                    |
| `JSONObjectExpression`         | JSON object literals                   |
| `JSXOpeningElement`            | `<Foo a b />`                          |
| `NewExpression`                | `new Foo(a, b)`                        |
| `ObjectExpression`             | `{ a, b }`                             |
| `ObjectPattern`                | `const { a, b } = obj`                 |
| `TSFunctionType`               | `(a: string) => void`                  |
| `TSInterfaceDeclaration`       | `interface Foo { a: 1; b: 2 }`         |
| `TSTupleType`                  | `[A, B]`                               |
| `TSTypeLiteral`                | `type Foo = { a: 1; b: 2 }`            |
| `TSTypeParameterDeclaration`   | `function f<A, B>() {}`                |
| `TSTypeParameterInstantiation` | `f<A, B>()`                            |

## Rule Conflicts

This rule might conflict with [object-curly-newline](https://eslint.org/docs/rules/object-curly-newline). You can turn it off:

```ts
export default {
  rules: {
    'object-curly-newline': 'off',
  }
}
```
