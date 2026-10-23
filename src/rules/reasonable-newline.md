# reasonable-newline

Enforce multiline objects, arrays and ternaries when they are complex. It only inserts line breaks (never removes them), so it pairs well with [`consistent-list-newline`](./consistent-list-newline.md) and your indent rules.

## Rule Details

An object or array must be multiline when any of these is true:

- An object has 4 or more properties **and** it is longer than 40 characters (see `minObjectProperties` and `objectLineLength`)
- An array has 4 or more items **and** it is longer than 40 characters (see `minArrayItems` and `arrayLineLength`)
- It has more than one spread element
- It has a child that is a call (`foo()`, `new Foo()`), a function (`() => {}`, methods), a ternary, a spread of anything other than an identifier / member chain (`...a ?? []`, `...foo()`), or a non-empty nested object / array

A ternary must break before `?` and `:` when its test, consequent or alternate is anything other than an identifier, literal or plain member chain.

<!-- eslint-skip -->
```js
// 👎 bad
const a = { ...draft.byFile, ...defaults.byFile }
const b = [...draft.calls, ...data.calls ?? []]
const c = [plugin, ...data.scopes ? [regexScopes(data.scopes)] : []]
const d = createLibraryPlugin({ name: 'x18n:i18next-shopify', derivedKeys, keyStyle: 'nested', placeholders })
const e = isFoo(a) ? foo : bar
```

<!-- eslint-skip -->
```js
// 👍 good
const a = {
  ...draft.byFile,
  ...defaults.byFile,
}
const b = [
  ...draft.calls,
  ...data.calls ?? [],
]
const c = [
  plugin,
  ...data.scopes
    ? [
        regexScopes(data.scopes),
      ]
    : [],
]
const d = createLibraryPlugin({
  name: 'x18n:i18next-shopify',
  derivedKeys,
  keyStyle: 'nested',
  placeholders,
})
const e = isFoo(a)
  ? foo
  : bar

// 👍 good, simple
const f = { a, b, c, d }
const g = [...a, b]
const h = a ? b : c
```

The rule only inserts breaks. Indentation and trailing commas are left to other rules (e.g. `style/indent`, `style/comma-dangle`).

## Options

<!-- eslint-skip -->
```ts
{
  // Objects with at least this many properties must be multiline...
  minObjectProperties?: number // default: 4
  // ...when they are longer than this
  objectLineLength?: number // default: 40
  // Same for arrays
  minArrayItems?: number // default: 4
  arrayLineLength?: number // default: 40
}
```
