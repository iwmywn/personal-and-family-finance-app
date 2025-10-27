"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Nav } from "@/components/layout/nav"
import { NavUser } from "@/components/layout/nav-user"
import { nav } from "@/lib/nav"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const tNavigation = useTranslations("navigation")
  const tCommonFE = useTranslations("common.fe")

  const translatedNav = nav.map((item) => ({
    ...item,
    title: tNavigation(item.title),
  }))

  return (
    <Sidebar
      className="pr-0 group-data-[state=collapsed]:pr-2.25"
      variant="floating"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenuButton size="lg" tooltip={tCommonFE("appDescription")}>
          <Image
            src="/images/logo.png"
            alt={`${tCommonFE("appName")} Logo`}
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {tCommonFE("appName")}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <Nav nav={translatedNav} />
      </SidebarContent>
      <SidebarFooter className="p-0">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
