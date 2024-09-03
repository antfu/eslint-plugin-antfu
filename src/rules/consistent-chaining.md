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
