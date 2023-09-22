import type { RuleFixer } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'consistent-object-newline'
export type MessageIds = 'shouldWrap' | 'shouldNotWrap'
export type Options = []

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Having line breaks styles to object, array and named imports',
      recommended: 'stylistic',
    },
    fixable: 'code',
    schema: [],
    messages: {
      shouldWrap: 'Should have line breaks between properties',
      shouldNotWrap: 'Should not have line breaks between properties',
    },
  },
  defaultOptions: [],
  create: (context) => {
    function removeLines(fixer: RuleFixer, start: number, end: number) {
      const range = [start, end] as const
      const code = context.getSourceCode().text.slice(...range)
      return fixer.replaceTextRange(range, code.replace(/\n/g, ''))
    }

    function check(node: TSESTree.Node, items: TSESTree.Node[]) {
      let mode: 'inline' | 'newline' | null = null
      let lastLine = node.loc.start.line

      items.forEach((item, idx) => {
        if (mode == null) {
          mode = item.loc.start.line === lastLine ? 'inline' : 'newline'
          lastLine = item.loc.end.line
          return
        }

        const currentStart = item.loc.start.line

        if (mode === 'newline' && currentStart === lastLine) {
          context.report({
            node: item,
            messageId: 'shouldWrap',
            *fix(fixer) {
              yield fixer.insertTextBefore(item, '\n')
            },
          })
        }
        else if (mode === 'inline' && currentStart !== lastLine) {
          const lastItem = items[idx - 1]
          context.report({
            node: item,
            messageId: 'shouldNotWrap',
            *fix(fixer) {
              yield removeLines(fixer, lastItem!.range[1], item.range[0])
            },
          })
        }

        lastLine = item.loc.end.line
      })

      const lastItem = items[items.length - 1]!
      if (mode === 'newline' && node.loc.end.line === lastLine) {
        context.report({
          node: lastItem,
          messageId: 'shouldWrap',
          *fix(fixer) {
            yield fixer.insertTextAfter(lastItem, '\n')
          },
        })
      }
      else if (mode === 'inline' && node.loc.end.line !== lastLine) {
        context.report({
          node: lastItem,
          messageId: 'shouldNotWrap',
          *fix(fixer) {
            yield removeLines(fixer, lastItem.range[1], node.range[1] - 1)
          },
        })
      }
    }

    return {
      ObjectExpression: (node) => {
        if (node.properties.length === 0)
          return
        check(node, node.properties)
      },
      ArrayExpression: (node) => {
        if (node.elements.length === 0)
          return
        check(node, node.elements.filter(Boolean) as TSESTree.Expression[])
      },

      ImportDeclaration: (node) => {
        if (node.specifiers.length === 0)
          return
        check(node, node.specifiers)
      },

      ExportNamedDeclaration: (node) => {
        if (node.specifiers.length === 0)
          return
        check(node, node.specifiers)
      },
    }
  },
})
