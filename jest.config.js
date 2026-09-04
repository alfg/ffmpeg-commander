module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  // v2/ is the Vite + React port and runs its own Vitest suite. Without this,
  // Jest's default testMatch picks up its specs and fails on the ESM-only
  // syntax they use (vitest imports, import.meta.glob).
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/v2/'],
  // Use babel-jest for TypeScript files so ts-jest (which warns about TS 5.x)
  // is never invoked as a transformer. ts-jest remains installed only because
  // the preset's require.resolve check requires it to be present.
  transform: {
    '^.+\\.vue$': require.resolve('@vue/vue2-jest'),
    '^.+\\.tsx?$': require.resolve('babel-jest'),
  },
};
