const authRoutes = ["/signin"]
const signInRoute = "/signin"
const DEFAULT_SIGNIN_REDIRECT = "/home"
const protectedRoutes = [
  "/home",
  "/statistics",
  "/transactions",
  "/categories",
  "/budgets",
  "/settings",
]
const ignoredRoutes = ["/images/", "/opengraph-image.png", "/icon.png"]

export {
  authRoutes,
  DEFAULT_SIGNIN_REDIRECT,
  protectedRoutes,
  signInRoute,
  ignoredRoutes,
}
