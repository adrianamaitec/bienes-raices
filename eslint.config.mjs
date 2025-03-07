import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import node from "eslint-plugin-n";

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends("plugin:prettier/recommended"),
  {
    plugins: {
      prettier,
      import: importPlugin,
      n: node,
    },
    rules: {
      "prettier/prettier": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "n/no-unsupported-features/es-syntax": [
        "error",
        { ignores: ["modules"] },
      ],
    },
  },
];
