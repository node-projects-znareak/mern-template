import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  globalIgnores(["node_modules", "dist", "coverage", "*.log"]),

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      import: fixupPluginRules(importPlugin),
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".mjs", ".cjs", ".ts", ".json"],
        },
      },
    },
    rules: {
      ...importPlugin.configs.recommended.rules,

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      quotes: ["warn", "double"],
      "prefer-const": "warn",
      "no-await-in-loop": "warn",
      "no-duplicate-imports": "warn",
      "no-template-curly-in-string": "warn",
      "no-unreachable-loop": "warn",
      "no-use-before-define": ["warn", { functions: false, classes: false }],
      "no-useless-assignment": "warn",
      "require-atomic-updates": "warn",
      "dot-notation": "warn",
      "no-useless-escape": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      eqeqeq: "warn",
      "max-params": "warn",
      "no-else-return": "warn",
      "no-lonely-if": "warn",
      "no-useless-return": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "require-await": "warn",

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
    },
  },

  {
    files: ["**/*.{js,cjs}"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  {
    files: ["**/*.test.{js,mjs,cjs,ts}", "**/*.spec.{js,mjs,cjs,ts}", "tests/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },

  // module-alias/register se ejecuta antes que los imports (solo en el JS compilado)
  {
    files: ["src/index.ts"],
    rules: {
      "import/first": "off",
    },
  },

  // Prettier siempre debe ir al final para desactivar las reglas de formato previas
  prettier,
);
