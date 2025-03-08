import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  nextConfig, // Use Next.js ESLint rules
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Fix JSX scope issue
      "@next/next/no-html-link-for-pages": "off" // Common Next.js warning
    }
  }
];
