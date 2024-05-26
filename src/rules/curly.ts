import type { TSESTree } from '@typescript-eslint/utils'
import { createEslintRule } from '../utils'

export const RULE_NAME = 'curly'
export type MessageIds = 'missingCurlyBrackets'
export type Options = []

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce Anthony\'s style of curly bracket',
      recommended: 'stylistic',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingCurlyBrackets: 'Expect curly brackets',
    },
  },
  defaultOptions: [],
  create: (context) => {
    function requireCurly(body: TSESTree.Statement) {
      // already has curly brackets
      if (body.type === 'BlockStatement')
        return true
      // nested statements
      if (['IfStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement'].includes(body.type))
        return true
      // multiline
      if (body.loc.start.line !== body.loc.end.line)
        return true
      return false
    }

    function wrapCurlyIfNeeded(body: TSESTree.Statement) {
      if (body.type === 'BlockStatement')
        return
      context.report({
        node: body,
        messageId: 'missingCurlyBrackets',
        *fix(fixer) {
          yield fixer.insertTextAfter(body, '\n}')
          const token = context.sourceCode.getTokenBefore(body)
          yield fixer.insertTextAfterRange(token!.range, ' {')
        },
      })
    }

    function check(...bodies: TSESTree.Statement[]) {
      const requires = bodies.map(body => requireCurly(body))

      // If any of the bodies requires curly brackets, wrap all of them to be consistent
      if (requires.some(i => i))
        bodies.map(body => wrapCurlyIfNeeded(body))
    }

    return {
      IfStatement(node) {
        const parent = node.parent
        // Already handled by the upper level if statement
        if (parent.type === 'IfStatement' && parent.alternate === node)
          return

        const statements: TSESTree.Statement[] = []
        function addIf(node: TSESTree.IfStatement) {
          statements.push(node.consequent)
          if (node.alternate) {
            if (node.alternate.type === 'IfStatement')
              addIf(node.alternate)
            else
              statements.push(node.alternate)
          }
        }
        addIf(node)
        check(...statements)
      },
      WhileStatement(node) {
        check(node.body)
      },
      DoWhileStatement(node) {
        check(node.body)
      },
      ForStatement(node) {
        check(node.body)
      },
      ForInStatement(node) {
        check(node.body)
      },
      ForOfStatement(node) {
        check(node.body)
      },
    }
  },
})
