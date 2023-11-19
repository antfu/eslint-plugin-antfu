import type { RuleFixer, RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'consistent-list-newline'
export type MessageIds = 'shouldWrap' | 'shouldNotWrap'
export type Options = [{
  ArrayExpression?: boolean
  ArrowFunctionExpression?: boolean
  CallExpression?: boolean
  ExportNamedDeclaration?: boolean
  FunctionDeclaration?: boolean
  FunctionExpression?: boolean
  ImportDeclaration?: boolean
  NewExpression?: boolean
  ObjectExpression?: boolean
  TSInterfaceDeclaration?: boolean
  TSTupleType?: boolean
  TSTypeLiteral?: boolean
  TSTypeParameterDeclaration?: boolean
  TSTypeParameterInstantiation?: boolean
  ObjectPattern?: boolean
  ArrayPattern?: boolean
}]

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Having line breaks styles to object, array and named imports',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    schema: [{
      type: 'object',
      properties: {
        ArrayExpression: { type: 'boolean' },
        ArrowFunctionExpression: { type: 'boolean' },
        CallExpression: { type: 'boolean' },
        ExportNamedDeclaration: { type: 'boolean' },
        FunctionDeclaration: { type: 'boolean' },
        FunctionExpression: { type: 'boolean' },
        ImportDeclaration: { type: 'boolean' },
        NewExpression: { type: 'boolean' },
        ObjectExpression: { type: 'boolean' },
        TSInterfaceDeclaration: { type: 'boolean' },
        TSTupleType: { type: 'boolean' },
        TSTypeLiteral: { type: 'boolean' },
        TSTypeParameterDeclaration: { type: 'boolean' },
        TSTypeParameterInstantiation: { type: 'boolean' },
        ObjectPattern: { type: 'boolean' },
        ArrayPattern: { type: 'boolean' },
      } satisfies Record<keyof Options[0], { type: 'boolean' }>,
      additionalProperties: false,
    }],
    messages: {
      shouldWrap: 'Should have line breaks between items, in node {{name}}',
      shouldNotWrap: 'Should not have line breaks between items, in node {{name}}',
    },
  },
  defaultOptions: [{}],
  create: (context, [options = {}] = [{}]) => {
    function removeLines(fixer: RuleFixer, start: number, end: number) {
      const range = [start, end] as const
      const code = context.sourceCode.text.slice(...range)
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

      const endRange = nextNode
        ? Math.min(
          context.sourceCode.getTokenBefore(nextNode)!.range[0],
          node.range[1],
        )
        : node.range[1]
      const endLoc = context.sourceCode.getLocFromIndex(endRange)

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
        // If there is only one multiline item, we allow the closing bracket to be on the a different line
        if (items.length === 1 && items[0].loc.start.line !== items[1]?.loc.start.line)
          return

        const content = context.sourceCode.text.slice(lastItem.range[1], endRange)
        if (content.includes('\n')) {
          context.report({
            node: lastItem,
            messageId: 'shouldNotWrap',
            data: {
              name: node.type,
            },
            *fix(fixer) {
              yield removeLines(fixer, lastItem.range[1], endRange)
            },
          })
        }
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
        const startNode
        // if has type generic, check the last type argument
        = node.typeArguments?.params.length
          ? node.typeArguments.params[node.typeArguments.params.length - 1]
          // if the callee is a member expression, get the property
          : node.callee.type === 'MemberExpression'
            ? node.callee.property
            // else get the callee
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
      TSTypeParameterDeclaration(node) {
        check(node, node.params)
      },
      TSTypeParameterInstantiation(node) {
        check(node, node.params)
      },
      ObjectPattern(node) {
        check(node, node.properties, undefined, node.typeAnnotation)
      },
      ArrayPattern(node) {
        check(node, node.elements)
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
          delete listenser[key]
      })

    return listenser
  },
})

// eslint-disable-next-line unused-imports/no-unused-vars
function exportType<A, B extends A>() {}
