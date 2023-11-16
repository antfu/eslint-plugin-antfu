import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'indent-binary-ops'
export type MessageIds = 'space'
export type Options = [{
  indent?: number | 'tab'
}]

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Indentation for binary operators',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          warn: {
            type: 'boolean',
          },
          indent: {
            anyOf: [
              {
                type: 'integer',
                minimum: 0,
              },
              {
                type: 'string',
                enum: ['tab'],
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      space: 'Expect indentation to be consistent',
    },
  },
  defaultOptions: [{ indent: 2 }],
  create: (context, options) => {
    const { sourceCode } = context

    const indentStr = options[0]?.indent === 'tab' ? '\t' : ' '.repeat(options[0]?.indent ?? 2)

    function getIndentOfLine(line: number) {
      return sourceCode.lines[line - 1].match(/^\s*/)?.[0] ?? ''
    }

    function firstTokenOfLine(line: number) {
      return sourceCode.tokensAndComments.find(token => token.loc.start.line === line)
    }
    function handler(node: TSESTree.BinaryExpression | TSESTree.LogicalExpression) {
      let tokenRight = sourceCode.getFirstToken(node.right)!
      let tokenOperator = sourceCode.getTokenBefore(tokenRight)!
      while (tokenOperator.value === '(') {
        tokenRight = tokenOperator
        tokenOperator = sourceCode.getTokenBefore(tokenRight)!
      }
      const tokenLeft = sourceCode.getTokenBefore(tokenOperator)!

      const isMultiline = tokenRight.loc.start.line !== tokenLeft.loc.start.line
      if (!isMultiline)
        return

      // If the first token of the line is a keyword (`if`, `return`, etc)
      const firstTokenOfLineLeft = firstTokenOfLine(tokenLeft.loc.start.line)
      const needAdditionIndent = firstTokenOfLineLeft?.type === 'Keyword'

      const indentTarget = getIndentOfLine(tokenLeft.loc.start.line) + (needAdditionIndent ? indentStr : '')
      const indentRight = getIndentOfLine(tokenRight.loc.start.line)
      if (indentTarget !== indentRight) {
        const start = {
          line: tokenRight.loc.start.line,
          column: 0,
        }
        const end = {
          line: tokenRight.loc.start.line,
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
              [sourceCode.getIndexFromLoc(start), sourceCode.getIndexFromLoc(end)],
              indentTarget,
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
