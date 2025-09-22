import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["simple-icons"],
    scrollRestoration: true,
    ppr: true,
    cpus: 1,
    reactCompiler: true,
    inlineCss: true,
  },
}

export default nextConfig
