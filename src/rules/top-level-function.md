# top-level-function

Enforce top-level function to be declared using `function` instead of arrow function or function expression. With auto-fix.

## Rule Details

<!-- eslint-skip -->
```ts
// 👎 bad
export const square = (a: number, b: number): number => {
  const a2 = a * a
  const b2 = b * b
  return a2 + b2 + 2 * a * b
}
```

<!-- eslint-skip -->
```ts
// 👎 bad
export const square = function (a: number, b: number): number {
  const a2 = a * a
  const b2 = b * b
  return a2 + b2 + 2 * a * b
}
```

<!-- eslint-skip -->
```js
// 👍 good
export function square(a: number, b: number): number {
  const a2 = a * a
  const b2 = b * b
  return a2 + b2 + 2 * a * b
}
```

### Exceptions

When the variable is assigned with types, it rule will ignore it.

<!-- eslint-skip -->
```ts
// 👍 ok
export const square: MyFunction = (a: number, b: number): number => {
  const a2 = a * a
  const b2 = b * b
  return a2 + b2 + 2 * a * b
}
```
