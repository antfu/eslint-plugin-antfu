# import-dedupe

Auto-fix import deduplication.

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
