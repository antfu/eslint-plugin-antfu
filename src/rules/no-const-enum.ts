import { createEslintRule } from '../utils'

export const RULE_NAME = 'no-const-enum'
export type MessageIds = 'noConstEnum'
export type Options = []

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Deprecated. Use \`'no-restricted-syntax': ['error', 'TSEnumDeclaration[const=true]']\` instead.`,
    },
    schema: [],
    messages: {
      noConstEnum: 'Do not use `const enum` expression',
    },
    deprecated: true,
  },
  defaultOptions: [],
  create: (context) => {
    return {
      TSEnumDeclaration: (node) => {
        if (node.const) {
          context.report({
            node,
            messageId: 'noConstEnum',
          })
        }
      },
    }
  },
})
