# indent-unindent

Enforce consistent indentation style for content inside template string with [`unindent`](https://github.com/antfu/utils/blob/6cc9a99faaca1767969a375fdb2f222130d196c8/src/string.ts#L124) tag.

## Rule Details

<!-- eslint-skip -->
```js
// 👎 bad
import { unindent } from '@antfu/utils'

const cases = [
  unindent`
const foo = {
  bar: 'baz', qux: 'quux',
  fez: 'fum'
}`,
  unindent`
      if (true) {
        console.log('hello')
      }`,
]
```

<!-- eslint-skip -->
```js
// 👍 good
import { unindent } from '@antfu/utils'

const cases = [
  unindent`
    const foo = {
      bar: 'baz', qux: 'quux',
      fez: 'fum'
    }
  `,
  unindent`
    if (true) {
      console.log('hello')
    }
  `,
]
```

By default it affects the template tag named `unindent`, `unIndent` or `$`. This rule works specifically for the `unindent` utility function from [`@antfu/utils`](https://github.com/antfu), where the leading and trailing empty lines are removed, and the common indentation is removed from each line. This rule fixes the content inside the template string but shall not affect the runtime result.

## Known issues

This rule will report errors when files use `CRLF`.

We strongly recommend standardizing line endings to `LF` to avoid these warnings and ensure cross-platform compatibility.

You can configure your environment by setting `"files.eol": "\n"` in VSCode or use the ESLint rule: <https://eslint.style/rules/linebreak-style>.

---

**Why LF?**
- Avoids mixed line endings in collaborative environments
- Aligns with Unix/Linux/macOS standards and modern toolchains
- Eliminates Git diff noise caused by CRLF/LF conflicts
