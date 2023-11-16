# indent-binary-ops

Auto-fix for multiple binary operator indentation.

This rule tries to fix the long-standing issue of binary operators indentation:
- https://github.com/eslint/eslint/issues/12248

Example fix:
- https://github.com/eslint-stylistic/eslint-stylistic/commit/1aaa53f0dd99aeb17b0eb793ed189a085a46f0a8

## Caveats

When using with `@stylistic/ts/indent`, we suggest to ignore `TSUnionType` and `TSIntersectionType`.

```json
{
  "rules": {
    "@stylistic/indent": ["error", 2, {
      "ignoredNodes": [
        "TSUnionType",
        "TSIntersectionType"
      ]
    }],
    "@stylistic/indent-binary-ops": ["error", { "indent": 2 }]
  }
}
```
