import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['vendor'],
  },
  {
    rules: {
      'antfu/consistent-list-newline': 'error',
      'style/object-curly-newline': 'off',
    },
  },
)
