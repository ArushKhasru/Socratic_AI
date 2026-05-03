import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",
    },
  },
];
