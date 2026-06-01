import "./env/client"
import "./env/server"

import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: [
      "./actions",
      "./app",
      "./components",
      "./hooks",
      "./lib",
      "./schemas",
    ],
    extract: true,
    messages: {
      format: "po",
      path: "./messages",
      locales: "infer",
      sourceLocale: "en-US",
      precompile: true,
    },
  },
})

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    scrollRestoration: true,
    cpus: 1,
    inlineCss: true,
    staleTimes: {
      dynamic: 300,
      static: 180,
    },
  },
  cacheComponents: true,
  reactCompiler: true,
}

export default withNextIntl(nextConfig)
