import type { Route } from "next"

export const signInRoute: Route = "/signin"
export const twoFactorRoute: Route = "/two-factor"
export const authRoutes: Route[] = [signInRoute, twoFactorRoute]
export const DEFAULT_SIGNIN_REDIRECT: Route = "/home"
export const protectedRoutes: Route[] = [
  "/home",
  "/statistics",
  "/transactions",
  "/categories",
  "/budgets",
  "/goals",
  "/recurring",
  "/settings",
  "/admin",
]
