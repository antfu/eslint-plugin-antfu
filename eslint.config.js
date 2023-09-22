import antfu from '@antfu/eslint-config'

export default antfu(
  undefined,
  {
    ignores: ['vendor'],
  },
  {
    rules: {
      'antfu/consistent-object-newline': 'error',
      'style/object-curly-newline': 'off',
    },
  },
)
