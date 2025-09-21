const authRoutes = ["/signin", "/forgot-password", "/email-handler"]
const signInRoute = "/signin"
const DEFAULT_SIGNIN_REDIRECT = "/home"
const protectedRoutes = ["/home", "/settings"]

export { authRoutes, DEFAULT_SIGNIN_REDIRECT, protectedRoutes, signInRoute }
