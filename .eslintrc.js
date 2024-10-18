module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,
      jest: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:jsx-a11y/recommended",
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: "module",
    },
    plugins: ["react", "jsx-a11y"],
    rules: {
      "no-unused-vars": "warn",
      "no-empty": "warn",
      "no-cond-assign": ["error", "always"],
      "no-prototype-builtins": "off",
      "no-undef": "error",
      "react/prop-types": "off",
      "jsx-a11y/anchor-is-valid": "off",
    },
    ignorePatterns: ["build/"],
  };
  