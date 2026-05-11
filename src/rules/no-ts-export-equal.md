# no-ts-export-equal

Disallow TypeScript's `export =` syntax. Use the ESM `export default` form instead — it interoperates cleanly with modern bundlers and Node.js ESM.

## Rule Details

<!-- eslint-skip -->
```ts
// 👎 bad
export = {}
```

<!-- eslint-skip -->
```ts
// 👍 good
export default {}
```

This rule only fires inside TypeScript files (`.ts`, `.tsx`, `.mts`, `.cts`). `export =` in plain JavaScript files is left untouched.
