import { createRuleTester } from './_test'
import rule, { RULE_NAME } from './no-ts-export-equal'

const tester = createRuleTester({
  name: RULE_NAME,
  rule,
})

describe('valid', () => {
  [
    { code: 'export default {}', filename: 'test.ts' },
    { code: 'export = {}', filename: 'test.js' },
  ].forEach((valid, idx) => {
    it(`valid ${idx}`, () => {
      tester.valid(valid)
    })
  })
})

describe('invalid', () => {
  it('1', () => {
    expect(
      tester.each({
        code: 'export = {}',
        filename: 'test.ts',
      }).messages,
    ).toMatchInlineSnapshot(`
      [
        {
          "column": 1,
          "endColumn": 12,
          "endLine": 1,
          "line": 1,
          "message": "Use ESM \`export default\` instead",
          "messageId": "noTsExportEqual",
          "nodeType": "TSExportAssignment",
          "ruleId": "no-ts-export-equal",
          "severity": 2,
        },
      ]
    `)
  })
})
