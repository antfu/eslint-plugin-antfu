import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'no-top-level-await'
export type MessageIds = 'NoTopLevelAwait'
export type Options = []

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent using top-level await',
    },
    schema: [],
    messages: {
      NoTopLevelAwait: 'Do not use top-level await',
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      AwaitExpression: (node) => {
        let parent: TSESTree.Node | undefined = node.parent
        while (parent) {
          if (parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression' || parent.type === 'ArrowFunctionExpression') {
            return
          }
          parent = parent.parent
        }
        context.report({
          node,
          messageId: 'NoTopLevelAwait',
        })
      },
    }
  },
})
