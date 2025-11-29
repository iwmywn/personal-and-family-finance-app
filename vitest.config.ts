import { resolve } from "node:path"
import { defineConfig, type UserWorkspaceConfig } from "vitest/config"

const baseTestConfig = {
  globals: true,
}
const baseResolveConfig = {
  alias: { "@": resolve(__dirname, "./") },
}

const projects: UserWorkspaceConfig[] = [
  {
    test: {
      ...baseTestConfig,
      name: "frontend",
      include: ["tests/frontend/**/*.test.ts"],
      setupFiles: ["./tests/frontend/setup.ts"],
      environment: "jsdom",
    },
    resolve: {
      ...baseResolveConfig,
    },
  },
  {
    test: {
      ...baseTestConfig,
      name: "backend",
      include: ["tests/backend/**/*.test.ts"],
      setupFiles: ["./tests/backend/setup.ts"],
      environment: "node",
      testTimeout: 120_000,
      hookTimeout: 300_000,
    },
    resolve: {
      ...baseResolveConfig,
    },
  },
]

export default defineConfig({
  test: {
    projects,
  },
})
