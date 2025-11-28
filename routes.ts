const signInRoute = "/signin"
const twoFactorRoute = "/two-factor"
const authRoutes = [signInRoute, twoFactorRoute]
const DEFAULT_SIGNIN_REDIRECT = "/home"
const protectedRoutes = [
  "/home",
  "/statistics",
  "/transactions",
  "/categories",
  "/budgets",
  "/goals",
  "/recurring",
  "/settings",
]
const ignoredRoutes = ["/images", "/opengraph-image.png", "/icon.png"]

export {
  signInRoute,
  twoFactorRoute,
  authRoutes,
  DEFAULT_SIGNIN_REDIRECT,
  protectedRoutes,
  ignoredRoutes,
}
