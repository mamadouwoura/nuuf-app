import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Textes français : les apostrophes sont valides en JSX, la règle ne fait que du bruit.
    rules: { "react/no-unescaped-entities": "off" },
  },
  {
    // Outils de développement en Node (CommonJS) : require() est normal ici.
    files: ["scripts/**/*.cjs", "tests/**/*.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".netlify/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
