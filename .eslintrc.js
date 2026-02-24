module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'vue/no-reserved-component-names': 'off',
    'vuejs-accessibility/media-has-caption': 'off',
    // TypeScript-aware resolver handles these; ESLint import plugin cannot
    // resolve webpack/TypeScript path aliases or extensionless TS imports.
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    // Suppress the "unsupported TypeScript version" warning from
    // @typescript-eslint when using TypeScript 5.x with @typescript-eslint v5.
    warnOnUnsupportedTypeScriptVersion: false,
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
