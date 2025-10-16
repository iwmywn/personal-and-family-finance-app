import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    scrollRestoration: true,
    cpus: 1,
    inlineCss: true,
    reactCompiler: true,
  },
}

export default nextConfig
