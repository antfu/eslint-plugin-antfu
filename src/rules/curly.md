# curly

Anthony's opinionated taste with curly. Simliar to eslint's builtin curly: [`['error', 'multi-or-nest', 'consistent']`](https://eslint.org/docs/latest/rules/curly#consistent) but allows both curly and non-curly on one-liner. This rule is not configurable.

## Rule Details

<!-- eslint-skip -->
```js
// 👍 ok
if (foo) {
  bar()
}

// 👍 ok
if (foo)
  bar()
```

<!-- eslint-skip -->
```js
// 👎 bad
if (foo)
  const obj = {
    bar: 'bar'
  }
```
