import type { RuleFixer, RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'consistent-list-newline'
export type MessageIds = 'shouldWrap' | 'shouldNotWrap'
export type Options = [{
  FunctionDeclaration?: boolean
  FunctionExpression?: boolean
  ArrowFunctionExpression?: boolean
  CallExpression?: boolean
  ObjectExpression?: boolean
  ArrayExpression?: boolean
  ImportDeclaration?: boolean
  ExportNamedDeclaration?: boolean
}]

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
  defaultOptions: [{
    FunctionDeclaration: true,
    FunctionExpression: true,
    ArrowFunctionExpression: true,
    CallExpression: true,
    ObjectExpression: true,
    ArrayExpression: true,
    ImportDeclaration: true,
    ExportNamedDeclaration: true,
  }],
  create: (context, [options = {}] = [{}]) => {
    function removeLines(fixer: RuleFixer, start: number, end: number) {
      const range = [start, end] as const
      const code = context.getSourceCode().text.slice(...range)
      return fixer.replaceTextRange(range, code.replace(/(\r\n|\n)/g, ''))
    }

    function check(node: TSESTree.Node, children: (TSESTree.Node | null)[]) {
      const items = children.filter(Boolean) as TSESTree.Node[]
      if (items.length === 0)
        return
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

    const listenser: RuleListener = {
      ObjectExpression: (node) => {
        check(node, node.properties)
      },
      ArrayExpression: (node) => {
        check(node, node.elements)
      },
      ImportDeclaration: (node) => {
        check(node, node.specifiers)
      },
      ExportNamedDeclaration: (node) => {
        check(node, node.specifiers)
      },
      FunctionDeclaration: (node) => {
        check(node, node.params)
      },
      FunctionExpression: (node) => {
        check(node, node.params)
      },
      ArrowFunctionExpression: (node) => {
        check(node, node.params)
      },
      CallExpression: (node) => {
        check(node, node.arguments)
      },
    }

    ;(Object.keys(options) as (keyof Options[0])[])
      .forEach((key) => {
        if (options[key] === false)
          // eslint-disable-next-line ts/no-dynamic-delete
          delete listenser[key]
      })

    return listenser
  },
})
