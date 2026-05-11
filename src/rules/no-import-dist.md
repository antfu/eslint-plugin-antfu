# no-import-dist

Prevent importing from a local `dist` folder. Distributed bundles should not be imported directly — import from the package source or its public entry instead.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
import a from '../dist/a'
import '../dist/b'
import b from 'dist'
import c from './dist'
```

<!-- eslint-skip -->
```js
// 👍 good
import xxx from 'a'
import 'b'

// Importing assets from a published package's `dist` is fine
import 'floating-vue/dist/foo.css'
```

The rule only flags imports that look like a local `dist` folder — either the bare specifier `dist`, a relative path starting with `./dist` or `../dist`, or any relative path containing `/dist/`. Imports of files inside a published package's `dist` (e.g. `floating-vue/dist/foo.css`) are intentionally allowed.
