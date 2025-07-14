import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import react from "@eslint-react/eslint-plugin";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import eslintPluginImportX from "eslint-plugin-import-x";
import regexPlugin from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
const compat = new FlatCompat({
  baseDirectory: import.meta.url,
});

const config = tseslint.config(
  {
    ignores: ["node_modules", "public"],
  },
  // Base
  js.configs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  comments.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member
  regexPlugin.configs["flat/recommended"],
  security.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  reactRefresh.configs.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member
  ...tseslint.configs.recommended,

  // React
  ...compat.extends("plugin:react/recommended"),
  ...compat.extends("plugin:react/jsx-runtime"),
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.plugins("react-compiler"),

  react.configs["recommended-type-checked"],

  // // Tailwind
  // ...tailwind.configs["flat/recommended"],

  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      // eslint-disable-next-line import-x/no-named-as-default-member
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.url,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
      "import-x/extensions": [".js", ".jsx"],
    },
    rules: {
      // "import-x/no-unresolved": ["error", { ignore: ["geist"] }],
      "import-x/no-unresolved": ["off", { ignore: ["geist"] }],
      "tailwindcss/no-custom-classname": "off",
      "react-compiler/react-compiler": "error",
      "prefer-const": "warn",
      "no-await-in-loop": "warn",
      "no-duplicate-imports": "warn",
      "no-template-curly-in-string": "warn",
      "no-unreachable-loop": "warn",
      "no-use-before-define": "warn",
      "no-useless-assignment": "warn",
      "require-atomic-updates": "warn",
      "dot-notation": "warn",
      "no-useless-escape": "warn",
      "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect": "off",
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      eqeqeq: "warn",
      "max-params": "warn",
      "no-else-return": "warn",
      "no-lonely-if": "warn",
      "no-useless-return": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "require-await": "warn",
      "tailwindcss/classnames-order": "off",
      "react/prop-types": "off",
      "import-x/default": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "security/detect-object-injection": "off",
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary", "coerce"] }],
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react/destructuring-assignment": "warn",
      "jsx-a11y/media-has-caption": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "function",
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "default",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          // Specify PascalCase for React components
          format: ["PascalCase", "camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "parameter",
          format: ["camelCase", "snake_case", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "property",
          format: null,
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },

  {
    files: ["**/*.cjs", "**/*.cts"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    files: ["*.ts", "*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],

        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      // enable all recommended rules to report a warning
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      // enable all recommended rules to report an error
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      // Override problematic rules for TailwindCSS 4 compatibility
      "better-tailwindcss/enforce-consistent-class-order": "warn",
    },
    settings: {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: "src/styles/global.css",
      },
    },
  },
  prettierConfig
);

export default config;
