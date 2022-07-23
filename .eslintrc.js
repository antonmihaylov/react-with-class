/** @type{import("eslint").ESLint.ConfigData}*/
module.exports = {
  extends: ['antomic/recommended', 'antomic/react', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: { 'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } } },
}
