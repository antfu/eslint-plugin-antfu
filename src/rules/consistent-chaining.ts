import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'consistent-chaining'
export type MessageIds = 'shouldWrap' | 'shouldNotWrap'
export type Options = [
  {
    allowLeadingPropertyAccess?: boolean
  },
]

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Having line breaks styles to object, array and named imports',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          allowLeadingPropertyAccess: {
            type: 'boolean',
            description: 'Allow leading property access to be on the same line',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      shouldWrap: 'Should have line breaks between items, in node {{name}}',
      shouldNotWrap: 'Should not have line breaks between items, in node {{name}}',
    },
  },
  defaultOptions: [
    {
      allowLeadingPropertyAccess: true,
    },
  ],
  create: (context) => {
    const knownRoot = new WeakSet<any>()

    const {
      allowLeadingPropertyAccess = true,
    } = context.options[0] || {}

    return {
      MemberExpression(node) {
        let root: TSESTree.Node = node
        while (root.parent && (root.parent.type === 'MemberExpression' || root.parent.type === 'CallExpression'))
          root = root.parent
        if (knownRoot.has(root))
          return
        knownRoot.add(root)

        const members: TSESTree.MemberExpression[] = []
        let current: TSESTree.Node | undefined = root
        while (current) {
          switch (current.type) {
            case 'MemberExpression': {
              if (!current.computed)
                members.unshift(current)
              current = current.object
              break
            }
            case 'CallExpression': {
              current = current.callee
              break
            }
            case 'TSNonNullExpression': {
              current = current.expression
              break
            }
            default: {
              // Other type of note, that means we are probably reaching out the head
              current = undefined
              break
            }
          }
        }

        let leadingPropertyAcccess = allowLeadingPropertyAccess
        let mode: 'single' | 'multi' | null = null

        members.forEach((m) => {
          const token = context.sourceCode.getTokenBefore(m.property)!
          const tokenBefore = context.sourceCode.getTokenBefore(token)!
          const currentMode: 'single' | 'multi' = token.loc.start.line === tokenBefore.loc.end.line ? 'single' : 'multi'
          const object = m.object.type === 'TSNonNullExpression' ? m.object.expression : m.object
          if (
            leadingPropertyAcccess
            && (object.type === 'ThisExpression' || object.type === 'Identifier' || object.type === 'MemberExpression' || object.type === 'Literal')
            && currentMode === 'single'
          ) {
            return
          }

          leadingPropertyAcccess = false
          if (mode == null) {
            mode = currentMode
            return
          }

          if (mode !== currentMode) {
            context.report({
              messageId: mode === 'single' ? 'shouldNotWrap' : 'shouldWrap',
              loc: token.loc,
              data: {
                name: root.type,
              },
              fix(fixer) {
                if (mode === 'multi')
                  return fixer.insertTextAfter(tokenBefore, '\n')
                else
                  return fixer.removeRange([tokenBefore.range[1], token.range[0]])
              },
            })
          }
        })
      },
    }
  },
})
