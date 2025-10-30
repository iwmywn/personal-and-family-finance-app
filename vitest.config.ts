import { resolve } from "node:path"
import { defineConfig, type UserWorkspaceConfig } from "vitest/config"

const baseTestConfig = {
  globals: true,
  environment: "node",
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
      testTimeout: 120000,
      hookTimeout: 300000,
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
