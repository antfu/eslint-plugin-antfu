# no-import-node-modules-by-path

Prevent importing from `node_modules` by relative or absolute path. Reach for modules by their package name and let the resolver do its job.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
import a from '../node_modules/a'
import '../node_modules/b'
const c = require('../node_modules/c')
require('../node_modules/d')
```

<!-- eslint-skip -->
```js
// 👍 good
import xxx from 'a'
import 'b'
const c = require('c')
require('d')
```

Both `import` declarations and `require()` calls are checked. A specifier is flagged when its string value contains `/node_modules/`.
