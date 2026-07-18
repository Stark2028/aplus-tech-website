import { defineConfig } from "vitest/config";

// Rules tests talk to the Firebase emulators (which need Java), so they are
// kept OUT of the default `npm test` run and driven by `npm run test:rules`,
// which starts the emulators first. Sequential: they share one emulator.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
