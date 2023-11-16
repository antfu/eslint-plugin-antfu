import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { createEslintRule, warnOnce } from '../utils'

export const RULE_NAME = 'indent-binary-ops'
export type MessageIds = 'space'
export type Options = []

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Indentation for binary operators',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      space: 'Expect indentation to be consistent',
    },
  },
  defaultOptions: [],
  create: (context) => {
    warnOnce(`"${RULE_NAME}" is an experimental rule. It does not follow semver and can be removed at any time. Use at your own risk.`)

    const { sourceCode } = context

    function handler(node: TSESTree.BinaryExpression | TSESTree.LogicalExpression) {
      const isMultiline = node.left.loc.start.line !== node.right.loc.start.line
      if (!isMultiline)
        return
      const indentLeft = sourceCode.lines[node.left.loc.start.line - 1].match(/^\s*/)?.[0] ?? ''
      const indentRight = sourceCode.lines[node.right.loc.start.line - 1].match(/^\s*/)?.[0] ?? ''
      if (indentLeft !== indentRight) {
        const start = {
          line: node.right.loc.start.line,
          column: 0,
        }
        const end = {
          line: node.right.loc.start.line,
          column: indentRight.length,
        }
        context.report({
          node,
          loc: {
            start,
            end,
          },
          messageId: 'space',
          fix(fixer) {
            return fixer.replaceTextRange(
              [context.sourceCode.getIndexFromLoc(start), context.sourceCode.getIndexFromLoc(end)],
              indentLeft,
            )
          },
        })
      }
    }

    return {
      BinaryExpression: handler,
      LogicalExpression: handler,
    }
  },
})
