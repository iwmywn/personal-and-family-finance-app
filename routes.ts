const authRoutes = ["/signin", "/forgot-password", "/email-handler"]
const signInRoute = "/signin"
const DEFAULT_SIGNIN_REDIRECT = "/home"
const protectedRoutes = ["/home", "/settings"]
const ignoredRoutes = ["/images/"]

export {
  authRoutes,
  DEFAULT_SIGNIN_REDIRECT,
  protectedRoutes,
  signInRoute,
  ignoredRoutes,
}
