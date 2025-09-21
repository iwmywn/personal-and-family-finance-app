import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
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
