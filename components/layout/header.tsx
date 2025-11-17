"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SlashIcon } from "lucide-react"
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
import { env } from "@/env/client.mjs"
import { mainNav, secondaryNav } from "@/lib/nav"

const ColorDialog =
  env.NEXT_PUBLIC_NODE_ENV === "development"
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
  const t = useTranslations()

  const allNavItems = [...mainNav, ...secondaryNav]
  const foundItem = allNavItems.find((item) => item.url === pathname)

  return (
    <header className="bg-primary-foreground sticky top-0 z-50 flex shrink-0 items-center justify-between py-2 backdrop-blur-xs backdrop-saturate-150">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {pathname === "/home" ? (
                <BreadcrumbPage>{t("navigation.home")}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/home">{t("navigation.home")}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {pathname !== "/home" && (
              <>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {foundItem
                      ? t(`navigation.${foundItem.key}`)
                      : t("common.fe.notFound")}
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
