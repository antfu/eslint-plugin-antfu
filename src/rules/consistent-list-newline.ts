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
  TSInterfaceDeclaration?: boolean
  TSTypeLiteral?: boolean
  TSTupleType?: boolean
  NewExpression?: boolean
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
      shouldWrap: 'Should have line breaks between items',
      shouldNotWrap: 'Should not have line breaks between items',
    },
  },
  defaultOptions: [{}],
  create: (context, [options = {}] = [{}]) => {
    function removeLines(fixer: RuleFixer, start: number, end: number) {
      const range = [start, end] as const
      const code = context.getSourceCode().text.slice(...range)
      return fixer.replaceTextRange(range, code.replace(/(\r\n|\n)/g, ''))
    }

    function check(
      node: TSESTree.Node,
      children: (TSESTree.Node | null)[],
      prevNode?: TSESTree.Node,
      nextNode?: TSESTree.Node,
    ) {
      const items = children.filter(Boolean) as TSESTree.Node[]
      if (items.length === 0)
        return

      const startLine = prevNode
        ? prevNode.loc.end.line
        : node.loc.start.line
      let mode: 'inline' | 'newline' | null = null
      let lastLine = startLine

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

      const endLoc = nextNode?.loc.start ?? node.loc.end
      const endRange = nextNode?.range[0]
        ? nextNode?.range[0] - 1
        : node.range[1]

      const lastItem = items[items.length - 1]!
      if (mode === 'newline' && endLoc.line === lastLine) {
        context.report({
          node: lastItem,
          messageId: 'shouldWrap',
          *fix(fixer) {
            yield fixer.insertTextAfter(lastItem, '\n')
          },
        })
      }
      else if (mode === 'inline' && endLoc.line !== lastLine) {
        context.report({
          node: lastItem,
          messageId: 'shouldNotWrap',
          *fix(fixer) {
            yield removeLines(fixer, lastItem.range[1], endRange)
          },
        })
      }
    }

    const listenser = {
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
        check(
          node,
          node.params,
          node.typeParameters || undefined,
          node.returnType || node.body,
        )
      },
      FunctionExpression: (node) => {
        check(
          node,
          node.params,
          node.typeParameters || undefined,
          node.returnType || node.body,
        )
      },
      ArrowFunctionExpression: (node) => {
        check(
          node,
          node.params,
          node.typeParameters || undefined,
          node.returnType || node.body,
        )
      },
      CallExpression: (node) => {
        const startNode = node.callee.type === 'MemberExpression'
          ? node.callee.property
          : node.callee
        check(node, node.arguments, startNode)
      },
      TSInterfaceDeclaration: (node) => {
        check(node, node.body.body)
      },
      TSTypeLiteral: (node) => {
        check(node, node.members)
      },
      TSTupleType: (node) => {
        check(node, node.elementTypes)
      },
      NewExpression: (node) => {
        check(node, node.arguments, node.callee)
      },
    } satisfies RuleListener

    type KeysListener = keyof typeof listenser
    type KeysOptions = keyof Options[0]

    // Type assertion to check if all keys are exported
    exportType<KeysListener, KeysOptions>()
    exportType<KeysOptions, KeysListener>()

    ;(Object.keys(options) as KeysOptions[])
      .forEach((key) => {
        if (options[key] === false)
          // eslint-disable-next-line ts/no-dynamic-delete
          delete listenser[key]
      })

    return listenser
  },
})

// eslint-disable-next-line unused-imports/no-unused-vars
function exportType<A, B extends A>() {}
