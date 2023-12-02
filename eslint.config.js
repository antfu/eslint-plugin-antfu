import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['vendor'],
  },
  {
    // TODO: remove when migrated to ESLint Stylistic
    rules: {
      'antfu/indent-binary-ops': 'off',
      'antfu/generic-spacing': 'off',
      'antfu/named-tuple-spacing': 'off',
    },
  },
)
