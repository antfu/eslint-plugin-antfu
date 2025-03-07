import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils'
import type { RuleFix, RuleFixer, RuleListener } from '@typescript-eslint/utils/ts-eslint'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'consistent-list-newline'
export type MessageIds = 'shouldWrap' | 'shouldNotWrap'
export type Options = [{
  ArrayExpression?: boolean
  ArrayPattern?: boolean
  ArrowFunctionExpression?: boolean
  CallExpression?: boolean
  ExportNamedDeclaration?: boolean
  FunctionDeclaration?: boolean
  FunctionExpression?: boolean
  ImportDeclaration?: boolean
  JSONArrayExpression?: boolean
  JSONObjectExpression?: boolean
  JSXOpeningElement?: boolean
  NewExpression?: boolean
  ObjectExpression?: boolean
  ObjectPattern?: boolean
  TSFunctionType?: boolean
  TSInterfaceDeclaration?: boolean
  TSTupleType?: boolean
  TSTypeLiteral?: boolean
  TSTypeParameterDeclaration?: boolean
  TSTypeParameterInstantiation?: boolean
}]

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Having line breaks styles to object, array and named imports',
    },
    fixable: 'whitespace',
    schema: [{
      type: 'object',
      properties: {
        ArrayExpression: { type: 'boolean' },
        ArrayPattern: { type: 'boolean' },
        ArrowFunctionExpression: { type: 'boolean' },
        CallExpression: { type: 'boolean' },
        ExportNamedDeclaration: { type: 'boolean' },
        FunctionDeclaration: { type: 'boolean' },
        FunctionExpression: { type: 'boolean' },
        ImportDeclaration: { type: 'boolean' },
        JSONArrayExpression: { type: 'boolean' },
        JSONObjectExpression: { type: 'boolean' },
        JSXOpeningElement: { type: 'boolean' },
        NewExpression: { type: 'boolean' },
        ObjectExpression: { type: 'boolean' },
        ObjectPattern: { type: 'boolean' },
        TSFunctionType: { type: 'boolean' },
        TSInterfaceDeclaration: { type: 'boolean' },
        TSTupleType: { type: 'boolean' },
        TSTypeLiteral: { type: 'boolean' },
        TSTypeParameterDeclaration: { type: 'boolean' },
        TSTypeParameterInstantiation: { type: 'boolean' },
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
    const multilineNodes = new Set([
      'ArrayExpression',
      'FunctionDeclaration',
      'ObjectExpression',
      'ObjectPattern',
      'TSTypeLiteral',
      'TSTupleType',
      'TSInterfaceDeclaration',
    ])
    function removeLines(fixer: RuleFixer, start: number, end: number, delimiter?: string): RuleFix {
      const range = [start, end] as const
      const code = context.sourceCode.text.slice(...range)
      return fixer.replaceTextRange(range, code.replace(/(\r\n|\n)/g, delimiter ?? ''))
    }

    function getDelimiter(root: TSESTree.Node, current: TSESTree.Node): string | undefined {
      if (root.type !== 'TSInterfaceDeclaration' && root.type !== 'TSTypeLiteral')
        return
      const currentContent = context.sourceCode.text.slice(current.range[0], current.range[1])
      return currentContent.match(/(?:,|;)$/) ? undefined : ','
    }

    function hasComments(current: TSESTree.Node): boolean {
      let program: TSESTree.Node = current
      while (program.type !== 'Program')
        program = program.parent
      const currentRange = current.range

      return !!program.comments?.some((comment) => {
        const commentRange = comment.range
        return (
          commentRange[0] > currentRange[0]
          && commentRange[1] < currentRange[1]
        )
      })
    }

    function check(
      node: TSESTree.Node,
      children: (TSESTree.Node | null)[],
      nextNode?: TSESTree.Node,
    ): void {
      const items = children.filter(Boolean) as TSESTree.Node[]
      if (items.length === 0)
        return

      // Look for the opening bracket, we first try to get the first token of the parent node
      // and fallback to the token before the first item
      let startToken = ['CallExpression', 'NewExpression'].includes(node.type)
        ? undefined
        : context.sourceCode.getFirstToken(node)
      if (node.type === 'CallExpression') {
        startToken = context.sourceCode.getTokenAfter(
          node.typeArguments
            ? node.typeArguments
            : node.callee.type === 'MemberExpression'
              ? node.callee.property
              : node.callee,
        )
      }
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
            * fix(fixer) {
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
              * fix(fixer) {
                yield removeLines(fixer, lastItem!.range[1], item.range[0], getDelimiter(node, lastItem))
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
          * fix(fixer) {
            yield fixer.insertTextAfter(lastItem, '\n')
          },
        })
      }
      else if (mode === 'inline' && endLoc.line !== lastLine) {
        // If there is only one multiline item, we allow the closing bracket to be on the a different line
        if (items.length === 1 && !(multilineNodes as Set<AST_NODE_TYPES>).has(node.type))
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
            * fix(fixer) {
              const delimiter = items.length === 1 ? '' : getDelimiter(node, lastItem)
              yield removeLines(fixer, lastItem.range[1], endRange, delimiter)
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
        check(
          node,
          node.specifiers[0]?.type === 'ImportDefaultSpecifier'
            ? node.specifiers.slice(1)
            : node.specifiers,
        )
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
      TSFunctionType: (node) => {
        check(node, node.params)
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
      JSONArrayExpression(node: TSESTree.ArrayExpression) {
        if (hasComments(node))
          return
        check(node, node.elements)
      },
      JSONObjectExpression(node: TSESTree.ObjectExpression) {
        if (hasComments(node))
          return

        check(node, node.properties)
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

// eslint-disable-next-line unused-imports/no-unused-vars, ts/explicit-function-return-type
function exportType<A, B extends A>() {}
