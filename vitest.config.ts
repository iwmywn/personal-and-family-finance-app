import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig, UserWorkspaceConfig } from "vitest/config"

const basePlugins = [tsconfigPaths({ ignoreConfigErrors: true })]

const projects: UserWorkspaceConfig[] = [
  {
    test: {
      name: "frontend",
      globals: true,
      environment: "node",
      include: ["tests/frontend/**/*.test.ts"],
      setupFiles: ["./tests/frontend/setup.ts"],
    },
    plugins: basePlugins,
  },
  {
    test: {
      name: "backend",
      globals: true,
      environment: "node",
      include: ["tests/backend/**/*.test.ts"],
      setupFiles: ["./tests/backend/setup.ts"],
      testTimeout: 120000,
      hookTimeout: 300000,
    },
    plugins: basePlugins,
  },
]

export default defineConfig({
  test: {
    projects,
  },
})
