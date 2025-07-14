import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    ignores: ["jest.config.js", "**/tests/*"],
  },
  {
    files: ["**/*.js", "src/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      "prefer-const": "warn",
      "no-await-in-loop": "warn",
      "no-duplicate-imports": "warn",
      "no-template-curly-in-string": "warn",
      "no-unreachable-loop": "warn",
      "no-use-before-define": "error",
      "no-useless-assignment": "warn",
      "require-atomic-updates": "warn",
      "dot-notation": "warn",
      "no-useless-escape": "warn",
      "no-unused-vars": "warn",
      eqeqeq: "warn",
      "max-params": "warn",
      "no-else-return": "warn",
      "no-lonely-if": "warn",
      "no-useless-return": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "require-await": "warn",
    },
  },
];
