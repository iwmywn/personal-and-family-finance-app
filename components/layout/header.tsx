"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Slash } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { nav } from "@/lib/nav"

const other = [
  {
    title: "settings",
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
  const t = useTranslations("navigation")

  const allNavItems = [...nav, ...other]
  const foundItem = allNavItems.find(
    (item) => item.url === pathname || pathname.startsWith(item.url)
  )

  return (
    <header className="bg-primary-foreground sticky top-0 z-50 flex shrink-0 items-center justify-between py-2 backdrop-blur-xs backdrop-saturate-150">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {pathname === "/home" ? (
                <BreadcrumbPage>{t("home")}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/home">{t("home")}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {pathname !== "/home" && (
              <>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {foundItem ? t(foundItem.title) : ""}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <ColorDialog />
      </div>
    </header>
  )
}
