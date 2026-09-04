module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  env: {
    test: {
      // isTSX is deliberately off: the project has no .tsx files, and the TSX
      // parser reads the angle-bracket casts in src/presets/index.ts
      // (`<IPresetOption[]>x`) as an unterminated JSX tag, which fails any test
      // that imports that module.
      presets: [
        ['@babel/preset-typescript', { allExtensions: true, isTSX: false }],
      ],
    },
  },
};
