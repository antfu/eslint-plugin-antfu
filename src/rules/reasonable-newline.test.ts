import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import { unindent as $ } from 'eslint-vitest-rule-tester'
import { run } from './_test'
import rule, { RULE_NAME } from './reasonable-newline'

const valids: ValidTestCase[] = [
  'const a = { a: 1, b: 2, c: 3 }',
  'const a = [1, 2, 3]',
  'const a = [...a, b]',
  'const a = { ...a, b }',
  'const a = [...a.b?.c]',
  'const a = { a: [], b: {} }',
  'const a = b ? c : d',
  'const a = b.c?.d ? e[0] : \'f\'',
  $`
    const a = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    }
  `,
  $`
    const a = [
      ...b,
      ...c,
    ]
  `,
  $`
    const a = b === 1
      ? foo()
      : bar
  `,
  'const a = { a: 1, b: 2, c: 3, d: 4 }',
  'const a = [\'aa\', \'bb\', \'cc\', \'dd\']',
  {
    code: 'const a = [\'fluent-vue\', \'fluent-vue-loader\', \'rollup-plugin-fluent-vue\', \'unplugin-fluent-vue\']',
    options: [{ arrayLineLength: 100 }],
  },
  {
    code: 'const a = { aaaaaaaaaa: 1, bbbbbbbbbb: 2, cccccccccc: 3, dddddddddd: 4, eeeeeeeeee: 5 }',
    options: [{ minObjectProperties: 6 }],
  },
  {
    code: 'const a = { aaaaaaaaaa: 1, bbbbbbbbbb: 2, cccccccccc: 3, dddddddddd: 4, eeeeeeeeee: 5 }',
    options: [{ objectLineLength: 100 }],
  },
]

const invalids: InvalidTestCase[] = [
  {
    description: 'object spreads',
    code: 'const a = { ...draft.namespace.byFile, ...defaults.namespace.byFile }',
    output: $`
      const a = {
      ...draft.namespace.byFile,
      ...defaults.namespace.byFile
      }
    `,
    errors: [{ messageId: 'shouldBreakSpreads' }],
  },
  {
    description: 'array spreads',
    code: 'const a = [...draft.usage.calls, ...data.scanners?.calls ?? []]',
    output: $`
      const a = [
      ...draft.usage.calls,
      ...data.scanners?.calls ?? []
      ]
    `,
    errors: [{ messageId: 'shouldBreakSpreads' }],
  },
  {
    description: 'spread of ternary',
    code: 'const a = [plugin, ...data.scopes ? [regexScopes(data.scopes.regex)] : []]',
    output: $`
      const a = [
      plugin,
      ...data.scopes
      ? [
      regexScopes(data.scopes.regex)
      ]
      : []
      ]
    `,
    errors: [
      { messageId: 'shouldBreakChild' },
      { messageId: 'shouldBreakTernary' },
      { messageId: 'shouldBreakChild' },
      { messageId: 'shouldBreakTernary' },
    ],
  },
  {
    description: 'function call as array child',
    code: 'const a = [\'a\', ...[\'b\', ...Array.from({ length: 10 })].map(f => f)]',
    output: $`
      const a = [
      'a',
      ...[
      'b',
      ...Array.from({ length: 10 })
      ].map(f => f)
      ]
    `,
    errors: [
      { messageId: 'shouldBreakChild' },
      { messageId: 'shouldBreakChild' },
    ],
  },
  {
    description: '4 properties',
    code: 'createLibraryPlugin({ name: \'x18n:i18next-shopify\', derivedKeys, keyStyle: \'nested\', placeholders: [braces] })',
    output: $`
      createLibraryPlugin({
      name: 'x18n:i18next-shopify',
      derivedKeys,
      keyStyle: 'nested',
      placeholders: [braces]
      })
    `,
    errors: [{ messageId: 'shouldBreakKeys' }],
  },
  {
    description: 'nested non-empty array in object',
    code: 'const a = { extensions: [...b, \'vue\'], patterns: [\'i18n\'] }',
    output: $`
      const a = {
      extensions: [...b, 'vue'],
      patterns: ['i18n']
      }
    `,
    errors: [{ messageId: 'shouldBreakChild' }],
  },
  {
    description: 'long array',
    code: 'const a = [\'fluent-vue\', \'fluent-vue-loader\', \'rollup-plugin-fluent-vue\', \'unplugin-fluent-vue\']',
    output: $`
      const a = [
      'fluent-vue',
      'fluent-vue-loader',
      'rollup-plugin-fluent-vue',
      'unplugin-fluent-vue'
      ]
    `,
    errors: [{ messageId: 'shouldBreakItems' }],
  },
  {
    description: 'functions as property values',
    code: 'const a = { \'vscode-extension\': { detect: ctx => ctx.has([\'vscode\']), load: () => import(\'./vscode-extension\') } }',
    output: $`
      const a = {
      'vscode-extension': {
      detect: ctx => ctx.has(['vscode']),
      load: () => import('./vscode-extension')
      }
      }
    `,
    errors: [
      { messageId: 'shouldBreakChild' },
      { messageId: 'shouldBreakChild' },
    ],
  },
  {
    description: 'partially broken',
    code: 'const a = [\n  foo(), bar()]',
    output: 'const a = [\n  foo(),\nbar()\n]',
    errors: [{ messageId: 'shouldBreakChild' }],
  },
  {
    description: 'complex ternary',
    code: 'const a = b === 1 ? foo() : bar',
    output: 'const a = b === 1\n? foo()\n: bar',
    errors: [
      { messageId: 'shouldBreakTernary' },
      { messageId: 'shouldBreakTernary' },
    ],
  },
  {
    description: 'only the missing break',
    code: 'const a = b === 1\n  ? foo() : bar',
    output: 'const a = b === 1\n  ? foo()\n: bar',
    errors: [{ messageId: 'shouldBreakTernary' }],
  },
  {
    description: 'custom threshold',
    code: 'const a = { a: 1, b: 2 }',
    options: [{ minObjectProperties: 2, objectLineLength: 0 }],
    output: 'const a = {\na: 1,\nb: 2\n}',
    errors: [{ messageId: 'shouldBreakKeys' }],
  },
]

run({
  name: RULE_NAME,
  rule,
  valid: valids,
  invalid: invalids,
})
