import createNextIntlPlugin from "next-intl/plugin"

import "./env/client.mjs"
import "./env/server.mjs"

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    scrollRestoration: true,
    cpus: 1,
    inlineCss: true,
    turbopackFileSystemCacheForDev: true,
  },
  cacheComponents: true,
  reactCompiler: true,
}

export default withNextIntl(nextConfig)
