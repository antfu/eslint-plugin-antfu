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
  JSXOpeningElement?: boolean
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
        JSXOpeningElement: { type: 'boolean' },
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
      nextNode?: TSESTree.Node,
    ) {
      const items = children.filter(Boolean) as TSESTree.Node[]
      if (items.length === 0)
        return

      // Look for the opening bracket, we first try to get the first token of the parent node
      // and fallback to the token before the first item
      let startToken = ['CallExpression', 'NewExpression'].includes(node.type)
        ? undefined
        : context.sourceCode.getFirstToken(node)
      if (startToken?.type !== 'Punctuator')
        startToken = context.sourceCode.getTokenBefore(items[0])

      const endToken = context.sourceCode.getTokenAfter(items[items.length - 1])
      const startLine = startToken!.loc.start.line

      if (startToken!.loc.start.line === endToken!.loc.end.line)
        return

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
            data: {
              name: node.type,
            },
            *fix(fixer) {
              yield fixer.insertTextBefore(item, '\n')
            },
          })
        }
        else if (mode === 'inline' && currentStart !== lastLine) {
          const lastItem = items[idx - 1]
          if (context.sourceCode.getCommentsBefore(item).length > 0)
            return
          const content = context.sourceCode.text.slice(lastItem!.range[1], item.range[0])
          if (content.includes('\n')) {
            context.report({
              node: item,
              messageId: 'shouldNotWrap',
              data: {
                name: node.type,
              },
              *fix(fixer) {
                yield removeLines(fixer, lastItem!.range[1], item.range[0])
              },
            })
          }
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
          data: {
            name: node.type,
          },
          *fix(fixer) {
            yield fixer.insertTextAfter(lastItem, '\n')
          },
        })
      }
      else if (mode === 'inline' && endLoc.line !== lastLine) {
        // If there is only one multiline item, we allow the closing bracket to be on the a different line
        if (items.length === 1 && items[0].loc.start.line !== items[1]?.loc.start.line)
          return
        if (context.sourceCode.getCommentsAfter(lastItem).length > 0)
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
          node.returnType || node.body,
        )
      },
      FunctionExpression: (node) => {
        check(
          node,
          node.params,
          node.returnType || node.body,
        )
      },
      ArrowFunctionExpression: (node) => {
        if (node.params.length <= 1)
          return
        check(
          node,
          node.params,
          node.returnType || node.body,
        )
      },
      CallExpression: (node) => {
        check(node, node.arguments)
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
        check(node, node.arguments)
      },
      TSTypeParameterDeclaration(node) {
        check(node, node.params)
      },
      TSTypeParameterInstantiation(node) {
        check(node, node.params)
      },
      ObjectPattern(node) {
        check(node, node.properties, node.typeAnnotation)
      },
      ArrayPattern(node) {
        check(node, node.elements)
      },
      JSXOpeningElement(node) {
        if (node.attributes.some(attr => attr.loc.start.line !== attr.loc.end.line))
          return

        check(node, node.attributes)
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
