# indent-binary-ops

Auto-fix for multiple binary operator indentation.

> [WARNING] This rule is experimental and does not follow semver.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
import { Foo, Bar, Foo } from 'foo'
```

Will be fixed to:

<!-- eslint-skip -->
```js
// 👍 good
import { Foo, Bar } from 'foo'
```
