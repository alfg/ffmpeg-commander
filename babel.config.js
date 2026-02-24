module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
      ],
    },
  },
};
