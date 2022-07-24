/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line unicorn/prefer-module, no-undef
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: 'test/tsconfig.json',
    },
  },
}
