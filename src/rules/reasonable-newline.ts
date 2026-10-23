import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'reasonable-newline'
export type MessageIds = 'shouldBreakKeys' | 'shouldBreakItems' | 'shouldBreakSpreads' | 'shouldBreakChild' | 'shouldBreakTernary'
export type Options = [{
  /**
   * Objects with at least this many properties must be multiline,
   * when their line is also longer than `objectLineLength`.
   *
   * @default 4
   */
  minObjectProperties?: number
  /**
   * Line length that an object with enough properties must exceed to be required multiline.
   *
   * @default 40
   */
  objectLineLength?: number
  /**
   * Arrays with at least this many items must be multiline,
   * when their line is also longer than `arrayLineLength`.
   *
   * @default 4
   */
  minArrayItems?: number
  /**
   * Line length that an array with enough items must exceed to be required multiline.
   *
   * @default 40
   */
  arrayLineLength?: number
}]

function unwrap(node: TSESTree.Node): TSESTree.Node {
  while (
    node.type === 'TSAsExpression'
    || node.type === 'TSNonNullExpression'
    || node.type === 'TSSatisfiesExpression'
    || node.type === 'TSTypeAssertion'
  ) {
    node = node.expression
  }
  return node
}

/**
 * Identifiers, literals and plain member chains (`a.b?.c[0]`)
 */
function isSimple(node: TSESTree.Node): boolean {
  node = unwrap(node)
  switch (node.type) {
    case 'Identifier':
    case 'Literal':
    case 'ThisExpression':
      return true
    case 'ChainExpression':
      return isSimple(node.expression)
    case 'MemberExpression':
      return isSimple(node.object) && (!node.computed || isSimple(node.property))
    default:
      return false
  }
}

function isComplexChild(node: TSESTree.Node): boolean {
  node = unwrap(node)
  switch (node.type) {
    case 'CallExpression':
    case 'NewExpression':
    case 'ConditionalExpression':
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return true
    case 'ChainExpression':
      return node.expression.type === 'CallExpression'
    case 'ArrayExpression':
      return node.elements.length > 0
    case 'ObjectExpression':
      return node.properties.length > 0
    case 'SpreadElement':
      return !isSimple(node.argument)
    case 'Property':
      return isComplexChild(node.value)
    default:
      return false
  }
}

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce multiline objects, arrays and ternaries when they are complex',
    },
    fixable: 'whitespace',
    schema: [{
      type: 'object',
      properties: {
        minObjectProperties: { type: 'integer', minimum: 1 },
        objectLineLength: { type: 'integer', minimum: 0 },
        minArrayItems: { type: 'integer', minimum: 1 },
        arrayLineLength: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    }],
    messages: {
      shouldBreakKeys: 'Objects with {{count}} or more properties on a line longer than {{length}} should have line breaks between items',
      shouldBreakItems: 'Arrays with {{count}} or more items on a line longer than {{length}} should have line breaks between items',
      shouldBreakSpreads: 'Multiple spread elements should have line breaks between items',
      shouldBreakChild: 'Items containing calls, functions, ternaries, complex spreads or non-empty nested objects/arrays should have line breaks between items',
      shouldBreakTernary: 'Complex ternaries should have line breaks before `{{token}}`',
    },
  },
  defaultOptions: [{ minObjectProperties: 4, objectLineLength: 40, minArrayItems: 4, arrayLineLength: 40 }],
  create: (context, [options = {}] = [{}]) => {
    const { sourceCode } = context
    const minObjectProperties = options.minObjectProperties ?? 4
    const objectLineLength = options.objectLineLength ?? 40
    const minArrayItems = options.minArrayItems ?? 4
    const arrayLineLength = options.arrayLineLength ?? 40

    function isLong(node: TSESTree.Node, limit: number): boolean {
      for (let line = node.loc.start.line; line <= node.loc.end.line; line++) {
        if (sourceCode.lines[line - 1].length > limit)
          return true
      }
      return false
    }

    function checkList(
      node: TSESTree.ArrayExpression | TSESTree.ObjectExpression,
      items: (TSESTree.Node | null)[],
    ): void {
      // Holes are rare enough, and breaking them would change nothing readable
      if (items.length === 0 || items.includes(null))
        return
      const nodes = items as TSESTree.Node[]

      let messageId: MessageIds | undefined
      if (node.type === 'ObjectExpression' && nodes.length >= minObjectProperties && isLong(node, objectLineLength))
        messageId = 'shouldBreakKeys'
      else if (node.type === 'ArrayExpression' && nodes.length >= minArrayItems && isLong(node, arrayLineLength))
        messageId = 'shouldBreakItems'
      else if (nodes.filter(i => i.type === 'SpreadElement').length > 1)
        messageId = 'shouldBreakSpreads'
      else if (nodes.some(isComplexChild))
        messageId = 'shouldBreakChild'
      if (!messageId)
        return

      // The first token after the opening bracket, after each comma, and the closing bracket
      const targets: TSESTree.Token[] = [sourceCode.getFirstToken(node)!]
      targets[0] = sourceCode.getTokenAfter(targets[0])!
      for (const item of nodes.slice(0, -1))
        targets.push(sourceCode.getTokenAfter(sourceCode.getTokenAfter(item, { filter: isComma })!)!)
      targets.push(sourceCode.getLastToken(node)!)

      const gaps = targets
        .map(target => ({ target, prev: sourceCode.getTokenBefore(target, { includeComments: true })! }))
        .filter(({ target, prev }) => prev.loc.end.line === target.loc.start.line)
      if (!gaps.length)
        return

      context.report({
        node,
        messageId,
        data: node.type === 'ObjectExpression'
          ? { count: minObjectProperties, length: objectLineLength }
          : { count: minArrayItems, length: arrayLineLength },
        * fix(fixer) {
          for (const { target, prev } of gaps)
            yield fixer.replaceTextRange([prev.range[1], target.range[0]], '\n')
        },
      })
    }

    function checkTernary(node: TSESTree.ConditionalExpression): void {
      if ([node.test, node.consequent, node.alternate].every(isSimple))
        return

      const tokens = [
        sourceCode.getTokenAfter(node.test, { filter: t => t.type === 'Punctuator' && t.value === '?' })!,
        sourceCode.getTokenAfter(node.consequent, { filter: t => t.type === 'Punctuator' && t.value === ':' })!,
      ]
      for (const token of tokens) {
        const prev = sourceCode.getTokenBefore(token, { includeComments: true })!
        if (prev.loc.end.line !== token.loc.start.line)
          continue
        context.report({
          loc: token.loc,
          messageId: 'shouldBreakTernary',
          data: { token: token.value },
          fix: fixer => fixer.replaceTextRange([prev.range[1], token.range[0]], '\n'),
        })
      }
    }

    return {
      ArrayExpression: node => checkList(node, node.elements),
      ObjectExpression: node => checkList(node, node.properties),
      ConditionalExpression: checkTernary,
    }
  },
})

function isComma(token: TSESTree.Token): boolean {
  return token.type === 'Punctuator' && token.value === ','
}
