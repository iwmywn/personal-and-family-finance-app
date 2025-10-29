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
import { siteConfig } from "@/app/pffa.config"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const tCommonFE = useTranslations("common.fe")

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
            alt={`${siteConfig.name} Logo`}
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{siteConfig.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <Nav />
      </SidebarContent>
      <SidebarFooter className="p-0">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
