import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["vi", "en"],

  // Used when no locale matches
  defaultLocale: "vi",

  // The `pathnames` object holds the mapping of internal pathnames
  // to localized pathnames. The key in the pathname must be
  // present in the `locales` array.
  pathnames: {
    // If all locales use the same pathname, a
    // single string can be provided.
    "/": "/",
    "/transactions": "/transactions",
    "/categories": "/categories",
    "/statistics": "/statistics",
    "/settings": "/settings",
    "/signin": "/signin",
  },
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
