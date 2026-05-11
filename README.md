# eslint-plugin-antfu

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

Anthony's opinionated ESLint rules, used as the foundation of [`@antfu/eslint-config`](https://github.com/antfu/eslint-config).

## Install

```bash
pnpm add -D eslint-plugin-antfu
```

> Most users should consume these rules via [`@antfu/eslint-config`](https://github.com/antfu/eslint-config), which wires them up with sensible defaults alongside the rest of Anthony's ESLint setup. Install this plugin directly only when you want to pick and choose individual rules.

## Usage

Register the plugin in your flat config and enable the rules you want:

```js
// eslint.config.js
import antfu from 'eslint-plugin-antfu'

export default [
  {
    plugins: {
      antfu,
    },
    rules: {
      'antfu/consistent-list-newline': 'error',
      'antfu/if-newline': 'error',
      'antfu/top-level-function': 'error',
    },
  },
]
```

## Rules

<!-- 🔧 = fixable · ⚙️ = configurable -->

| Rule                                                                                | Description                                                                              |     |     |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | :-: | :-: |
| [`consistent-chaining`](./src/rules/consistent-chaining.md)                         | Enforce consistent line breaks for chaining member access                                | 🔧  | ⚙️  |
| [`consistent-list-newline`](./src/rules/consistent-list-newline.md)                 | Enforce consistent line breaks inside braces and parentheses                             | 🔧  | ⚙️  |
| [`curly`](./src/rules/curly.md)                                                     | Opinionated curly bracket enforcement that allows both styles on one-liners              | 🔧  |     |
| [`if-newline`](./src/rules/if-newline.md)                                           | Enforce a newline between `if` and its consequent                                        | 🔧  |     |
| [`import-dedupe`](./src/rules/import-dedupe.md)                                     | Auto-fix duplicate named imports from the same source                                    | 🔧  |     |
| [`indent-unindent`](./src/rules/indent-unindent.md)                                 | Enforce consistent indentation inside `unindent` tagged template strings                 | 🔧  | ⚙️  |
| [`no-import-dist`](./src/rules/no-import-dist.md)                                   | Prevent importing from a local `dist` folder                                             |     |     |
| [`no-import-node-modules-by-path`](./src/rules/no-import-node-modules-by-path.md)   | Prevent importing from `node_modules` by relative or absolute path                       |     |     |
| [`no-top-level-await`](./src/rules/no-top-level-await.md)                           | Prevent top-level `await`                                                                |     |     |
| [`no-ts-export-equal`](./src/rules/no-ts-export-equal.md)                           | Prevent TypeScript's `export =` syntax in `.ts`/`.tsx`/`.mts`/`.cts` files               |     |     |
| [`top-level-function`](./src/rules/top-level-function.md)                           | Enforce top-level functions to be declared with the `function` keyword                   | 🔧  |     |

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg" alt="Sponsors"/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-antfu?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-antfu
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-antfu?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-antfu
