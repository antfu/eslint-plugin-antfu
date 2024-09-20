import type { ESLint, Linter } from 'eslint'
import { version } from '../package.json'
import consistentChaining from './rules/consistent-chaining'
import consistentListNewline from './rules/consistent-list-newline'
import curly from './rules/curly'
import ifNewline from './rules/if-newline'
import importDedupe from './rules/import-dedupe'
import indentUnindent from './rules/indent-unindent'
import noImportDist from './rules/no-import-dist'
import noImportNodeModulesByPath from './rules/no-import-node-modules-by-path'
import noTopLevelAwait from './rules/no-top-level-await'
import noTsExportEqual from './rules/no-ts-export-equal'
import topLevelFunction from './rules/top-level-function'

const plugin = {
  meta: {
    name: 'antfu',
    version,
  },
  // @keep-sorted
  rules: {
    'consistent-chaining': consistentChaining,
    'consistent-list-newline': consistentListNewline,
    'curly': curly,
    'if-newline': ifNewline,
    'import-dedupe': importDedupe,
    'indent-unindent': indentUnindent,
    'no-import-dist': noImportDist,
    'no-import-node-modules-by-path': noImportNodeModulesByPath,
    'no-top-level-await': noTopLevelAwait,
    'no-ts-export-equal': noTsExportEqual,
    'top-level-function': topLevelFunction,
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
