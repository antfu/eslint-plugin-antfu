# if-newline

Enforce line breaks between `if` statements and their consequent / alternate expressions. Only applicable for inline `if` statements.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
if (foo) bar()
```

<!-- eslint-skip -->
```js
// 👍 good
if (foo)
  bar()
```
