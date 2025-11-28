"use server"

import { type NextURL } from "next/dist/server/web/next-url"
import { NextResponse, type NextRequest } from "next/server"
import * as routes from "@/routes"

import { getCurrentSession } from "@/actions/session.actions"
import { siteConfig } from "@/app/pffa.config"

function redirectIfProtectedRoute(request: NextRequest) {
  const { nextUrl } = request
  const { pathname } = nextUrl

  if (
    pathname === routes.twoFactorRoute &&
    !request.cookies.has(`${siteConfig.name}.two_factor`)
  ) {
    return redirectTo(routes.signInRoute, nextUrl)
  }

  if (
    !routes.authRoutes.some((route) => pathname.startsWith(route)) &&
    !routes.ignoredRoutes.some((route) => pathname.startsWith(route))
  ) {
    const redirectUrl = new URL(routes.signInRoute, nextUrl)

    if (routes.protectedRoutes.some((route) => pathname.startsWith(route))) {
      redirectUrl.searchParams.set("next", pathname)
    }

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

function redirectTo(path: string, nextUrl: NextURL) {
  return NextResponse.redirect(new URL(path, nextUrl))
}

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req
  const { pathname } = nextUrl

  const session = await getCurrentSession()

  if (!session) {
    return redirectIfProtectedRoute(req)
  }

  if (
    routes.authRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/"
  ) {
    return redirectTo(routes.DEFAULT_SIGNIN_REDIRECT, nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
