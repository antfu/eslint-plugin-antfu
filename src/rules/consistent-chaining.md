# consistent-chaining

Enforce consistent line breaks for chaining member access.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
const foo1 = [].map(x => x + 'bar')
  .filter(Boolean)

const foo2 = []
  .map(x => x + 'bar').filter(Boolean)
```

<!-- eslint-skip -->
```js
// 👍 good
const foo1 = [].map(x => x + 'bar').filter(Boolean)

const foo2 = []
  .map(x => x + 'bar')
  .filter(Boolean)
```

It will check the newline style of the **first** property access and apply the same style to the rest of the chaining access.

## Options

```ts
export default {
  rules: {
    'antfu/consistent-chaining': ['error', {
      allowLeadingPropertyAccess: true,
    }],
  },
}
```

### `allowLeadingPropertyAccess`

- Type: `boolean`
- Default: `true`

When enabled, leading inline property accesses on identifiers, literals, `this`, or other member accesses are ignored when deciding the chaining style. This keeps short prefixes like `obj.a.b()` from forcing the rest of the chain onto one line.

<!-- eslint-skip -->
```js
// 👍 ok with `allowLeadingPropertyAccess: true` (default)
foo.bar
  .map(x => x + 1)
  .filter(Boolean)

// 👎 reported with `allowLeadingPropertyAccess: false`
foo.bar
  .map(x => x + 1)
  .filter(Boolean)
```
