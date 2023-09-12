module.exports = {
  root: true,

  env: { node: true },

  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
  ],

  plugins: [
    'import',
    'react-hooks',
  ],

  rules: {},

  overrides: [
    {
      // Source files
      files: ['*.ts', '*.tsx'],

      env: {
        node: true,
        browser: true,
        es6: true,
      },

      extends: [
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],

      parser: '@typescript-eslint/parser',
      parserOptions: { project: ['./tsconfig.src.json'] },

      plugins: [
        '@typescript-eslint',
      ],

      rules: {
        // This rule ensures that hooks are not conditionally called or nested
        // within other functions, which can lead to unpredictable behavior and
        // bugs. Following the rules of hooks ensures that React's state
        // management and side-effect mechanisms work as intended and maintains
        // the consistency of component state across renders.
        'react-hooks/rules-of-hooks': 'error',

        // This rule helps catch situations where not all dependencies are
        // listed, which can lead to bugs where the effect or callback does not
        // properly respond to changes in the application state. Ensuring an
        // exhaustive dependency list promotes code stability and prevents
        // subtle issues related to stale closures and outdated dependencies in
        // the hook's callback functions.
        'react-hooks/exhaustive-deps': 'error',
      },
    },
    {
      // Unit test files
      files: ['jest.*.ts', '*.spec.ts', '*.spec.tsx'],

      env: {
        'jest/globals': true
      },

      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style'
      ],

      parser: '@typescript-eslint/parser',
      parserOptions: { project: ['./tsconfig.test.jest.json'] },

      rules: {
        // Disallows assigning any to variables and properties.
        //
        // We are disabling this for tests files because we need it for example
        // in expect calls like `expect.any(Function)`
        //
        // https://typescript-eslint.io/rules/no-unsafe-assignment
        '@typescript-eslint/no-unsafe-assignment': 'off',

        // Enforce unbound methods are called with their expected scope.
        //
        // We are disabling this for tests files because we need it for example
        // in expect calls like `expect(window.localStorage.setItem)`
        //
        // https://typescript-eslint.io/rules/unbound-method/
        '@typescript-eslint/unbound-method': 'off',

        // Disallow member access on a value with type any.
        //
        // https://typescript-eslint.io/rules/no-unsafe-member-access/
        '@typescript-eslint/no-unsafe-member-access': 'off',

        // Disallows returning any from a function.
        //
        // We are disabling this for tests files because we need it for example
        // in jest.mock(...) library calls.
        //
        // https://typescript-eslint.io/rules/no-unsafe-return
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
  ],
};
