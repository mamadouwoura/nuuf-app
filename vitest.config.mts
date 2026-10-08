import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // Les tests d'intégration partagent une base : on les exécute l'un après l'autre.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
