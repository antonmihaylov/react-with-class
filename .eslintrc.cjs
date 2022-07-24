/** @type{import("eslint").ESLint.ConfigData}*/
const config = {
  extends: ['antomic/recommended', 'antomic/react', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: { 'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } } },
  rules: {
    'unicorn/filename-case': 'off',
  },
  overrides: [
    {
      files: 'test/**/*',
      extends: ['plugin:jest/recommended'],
      parserOptions: {
        project: './test/tsconfig.json',
      },
    },
  ],
}

// eslint-disable-next-line no-undef
module.exports = config
