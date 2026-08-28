module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn", // flags any remaining `any`
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: false, allowTypedFunctionExpressions: true },
    ],
    "@typescript-eslint/no-implicit-any-catch": "error",
  },
};