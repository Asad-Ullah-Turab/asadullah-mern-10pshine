import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // 1. Ignore build folders and node_modules
    ignores: ["dist", "node_modules", "bin"],
  },
  // 2. Load Recommended JS & TS rules
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // <--- CHANGED THIS from browser to node
      },
    },
    rules: {
      // 3. Add your personal preferences here
      "no-console": "off", // Usually keep this off for backend logging
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
    },
  },
);
