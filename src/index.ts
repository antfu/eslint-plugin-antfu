import type { ESLint, Linter } from 'eslint'
import { version } from '../package.json'
import genericSpacing from './rules/generic-spacing'
import ifNewline from './rules/if-newline'
import importDedupe from './rules/import-dedupe'
import preferInlineTypeImport from './rules/prefer-inline-type-import'
import topLevelFunction from './rules/top-level-function'
import noImportNodeModulesByPath from './rules/no-import-node-modules-by-path'
import noTsExportEqual from './rules/no-ts-export-equal'
import noCjsExports from './rules/no-cjs-exports'
import noConstEnum from './rules/no-const-enum'
import namedTupleSpacing from './rules/named-tuple-spacing'
import consistentListNewline from './rules/consistent-list-newline'
import indentBinaryOps from './rules/indent-binary-ops'

const plugin = {
  meta: {
    name: 'antfu',
    version,
  },
  rules: {
    'consistent-list-newline': consistentListNewline,
    'generic-spacing': genericSpacing,
    'if-newline': ifNewline,
    'import-dedupe': importDedupe,
    'named-tuple-spacing': namedTupleSpacing,
    'no-cjs-exports': noCjsExports,
    'no-import-node-modules-by-path': noImportNodeModulesByPath,
    'no-ts-export-equal': noTsExportEqual,
    'prefer-inline-type-import': preferInlineTypeImport,
    'top-level-function': topLevelFunction,
    'indent-binary-ops': indentBinaryOps,

    /**
     * @deprecated Use `'no-restricted-syntax': ['error', 'TSEnumDeclaration[const=true]']` instead.
     */
    'no-const-enum': noConstEnum,
  },
} satisfies ESLint.Plugin

export default plugin

type RuleDefinitions = typeof plugin['rules']

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions']
}

export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>
}
