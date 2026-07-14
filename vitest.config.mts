import { defineConfig } from "vitest/config";

// `resolve.tsconfigPaths` makes Vitest honor the `@/*` alias from tsconfig.json
// so tests import project modules the same way the app does.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["**/*.test.{ts,tsx}"],
    // Firebase rules tests need the emulator (and a JDK). They run separately
    // via `npm run test:rules` so the default suite stays dependency-free.
    exclude: ["**/node_modules/**", "tests/rules/**"],
    environment: "node",
  },
});
