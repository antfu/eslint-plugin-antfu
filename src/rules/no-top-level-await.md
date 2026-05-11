# no-top-level-await

Prevent `await` outside an `async` function. Top-level `await` is only valid in ESM modules and bundlers/runtimes that support it — using it can break compatibility with CJS consumers or older targets.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
await foo()

const a = {
  foo: await bar()
}
```

<!-- eslint-skip -->
```js
// 👍 good
async function foo() {
  await bar()
}

const a = async () => {
  await bar()
}
```

The rule walks up from each `AwaitExpression` and reports it when no enclosing `FunctionDeclaration`, `FunctionExpression`, or `ArrowFunctionExpression` is found.

## When Not To Use It

If you're authoring an application or ESM-only library that targets environments where top-level `await` is supported (modern browsers, Node.js 14.8+ ESM, Deno, Bun), you can safely disable this rule.
