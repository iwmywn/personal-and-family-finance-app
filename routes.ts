const authRoutes = ["/signin"]
const signInRoute = "/signin"
const DEFAULT_SIGNIN_REDIRECT = "/home"
const protectedRoutes = ["/home", "statistics", "/settings"]
const ignoredRoutes = ["/images/"]

export {
  authRoutes,
  DEFAULT_SIGNIN_REDIRECT,
  protectedRoutes,
  signInRoute,
  ignoredRoutes,
}
