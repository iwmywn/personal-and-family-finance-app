import createNextIntlPlugin from "next-intl/plugin"

import "./env/client.mjs"
import "./env/server.mjs"

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: ["./actions", "./app", "./components", "./hooks"],
    extract: {
      sourceLocale: "en-US",
    },
    messages: {
      path: "./messages",
      format: "po",
      locales: "infer",
    },
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    scrollRestoration: true,
    cpus: 1,
    inlineCss: true,
  },
  cacheComponents: true,
  reactCompiler: true,
}

export default withNextIntl(nextConfig)
