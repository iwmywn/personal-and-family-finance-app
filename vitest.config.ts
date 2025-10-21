import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 120000,
    hookTimeout: 300000,
  },
  plugins: [
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
  ],
})
