import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
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
