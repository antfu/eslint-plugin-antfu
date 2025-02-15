import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: 'node16',
  clean: true,
  externals: [
    '@typescript-eslint/utils',
  ],
  rollup: {
    inlineDependencies: [
      '@antfu/utils',
    ],
  },
})
