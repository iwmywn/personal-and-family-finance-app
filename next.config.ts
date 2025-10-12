import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["simple-icons"],
    scrollRestoration: true,
    // cacheComponents: true,
    cpus: 1,
    inlineCss: true,
  },
  reactCompiler: true,
}

export default nextConfig
