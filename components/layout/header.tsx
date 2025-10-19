"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Slash } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  RelativeTime,
  RelativeTimeZone,
  RelativeTimeZoneDate,
  RelativeTimeZoneDisplay,
  RelativeTimeZoneLabel,
} from "@/components/kibo-ui/relative-time"
import { nav } from "@/components/layout/app-sidebar"

const other = [
  {
    title: "Cài đặt",
    url: "/settings",
  },
]

const ColorDialog =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@/components/layout/color-dialog").then(
            (mod) => mod.ColorDialog
          ),
        { ssr: false }
      )
    : () => null

export function Header() {
  const pathname = usePathname()

  const allNavItems = [...nav, ...other]
  const foundItem = allNavItems.find(
    (item) => item.url === pathname || pathname.startsWith(item.url)
  )

  return (
    <header className="bg-primary-foreground/75 sticky top-0 z-50 flex shrink-0 items-center justify-between py-2 backdrop-blur-xs backdrop-saturate-150">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {pathname === "/home" ? (
                <BreadcrumbPage>Trang chủ</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/home">Trang chủ</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {pathname !== "/home" && (
              <>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{foundItem?.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <RelativeTime
          defaultTime={new Date()}
          dateFormatOptions={{
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "numeric",
          }}
          timeFormatOptions={{
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }}
        >
          <RelativeTimeZone zone="Asia/Ho_Chi_Minh">
            <RelativeTimeZoneLabel>VN</RelativeTimeZoneLabel>
            <RelativeTimeZoneDate />
            <RelativeTimeZoneDisplay className="pl-0" />
          </RelativeTimeZone>
        </RelativeTime>
        <ColorDialog />
      </div>
    </header>
  )
}
