"use server"

import { type NextURL } from "next/dist/server/web/next-url"
import { NextResponse, type NextRequest } from "next/server"
import * as routes from "@/routes"

import { session } from "@/lib/session"

function redirectIfProtectedRoute(nextUrl: NextURL) {
  const { pathname, search } = nextUrl

  if (
    pathname !== routes.signInRoute &&
    !routes.ignoredRoutes.some((route) => pathname.startsWith(route))
  ) {
    const redirectUrl = new URL(routes.signInRoute, nextUrl)

    if (routes.protectedRoutes.some((route) => pathname.startsWith(route))) {
      redirectUrl.searchParams.set("next", pathname + search)
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

  const { userId, expires } = await session.user.get()
  const expiresIn = new Date(expires).getTime() - Date.now()

  if (!userId || !expires || expiresIn < 0) {
    await session.user.delete()

    return redirectIfProtectedRoute(nextUrl)
  }

  if (
    routes.authRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/"
  ) {
    return redirectTo(routes.DEFAULT_SIGNIN_REDIRECT, nextUrl)
  }

  if (expiresIn < 24 * 60 * 60 * 1000) {
    await session.user.update()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
