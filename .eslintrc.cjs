module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:sonarjs/recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:unicorn/recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  ignorePatterns: [
    ".node_modules",
    "dist",
    "cache",
    "build",
    "**/node_modules/**",
    "public",
    "docker-compose*",
    ".stylelintcache",
    ".env*",
    "spec*.yaml",
    "router.ts",
    "migrations/**"
  ],
  globals: {
    google: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'sonarjs',
    'no-secrets',
    'react-refresh',
  ],
  rules: {
    'no-unused-vars': 'off',
    'unicorn/no-negated-condition': 'off',
    // common
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': ['error', 'always'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-constant-condition': 'warn',
    'no-debugger': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-cond-assign': ['error', 'always'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'no-restricted-syntax': [
      'error',
      'DebuggerStatement',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'object-curly-spacing': ['error', 'always'],

    // TS
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': false,
        },
      },
    ],
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],

    // sonarjs
    'sonarjs/no-duplicate-string': 'off',

    // import
    'import/order': 'off',
    'import/first': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unresolved': 'off',
    'import/named': 'error',

    // es6
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: false,
        allowUnboundThis: true,
      },
    ],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: true,
      },
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'generator-star-spacing': 'off',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],

    // best-practice
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'off',
    complexity: ['off', 11],
    eqeqeq: ['error', 'smart'],
    'no-alert': 'warn',
    'no-case-declarations': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-with': 'error',
    'no-void': 'error',
    'no-useless-escape': 'off',
    'vars-on-top': 'error',
    'require-await': 'off',
    'no-return-assign': 'off',
    'operator-linebreak': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'promise/always-return': [
      'error',
      {
        ignoreLastCallback: true,
      },
    ],

    // no-secrets
    'no-secrets/no-secrets': [
      'error',
      {
        additionalDelimiters: ['.', '-', '(?=[A-Z][a-z])'],
      },
    ],

    // unicorns
    'unicorn/new-for-builtins': 'off',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/no-array-instanceof': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/number-literal-case': 'error',
    'unicorn/prefer-exponentiation-operator': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-starts-ends-with': 'error',
    'unicorn/prefer-text-content': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          env: true,
          args: true,
          ProcessEnv: true,
          QueryParams: true,
          getEnv: true,
          props: true,
          Params: true,
          Props: true,
          ImportMetaEnv: true,
        },
      },
    ],
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-empty-file': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
          kebabCase: true,
        },
      },
    ],
    'unicorn/no-array-for-each': 'off',
    'unicorn/consistent-function-scoping': 'off',

    // elint-comments
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],

    // react
    'react/prop-types': 'off',
    'react/no-children-prop': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-vars': 'error',

    'react-refresh/only-export-components': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/ignore': ['node_modules'],
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
        paths: './tsconfig.json',
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
      },
    },
  },
}
