import { defineConfig } from "vitest/config";

// `resolve.tsconfigPaths` makes Vitest honor the `@/*` alias from tsconfig.json
// so tests import project modules the same way the app does.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
