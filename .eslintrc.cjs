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
}

// eslint-disable-next-line no-undef
module.exports = config
