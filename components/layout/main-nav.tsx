"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { mainNav } from "@/lib/nav"

export function MainNav() {
  const pathname = usePathname()
  const t = useTranslations()

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNav.map(({ key, url, icon: Icon }) => (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton
                  isActive={pathname === url}
                  tooltip={t(`navigation.${key}`)}
                  asChild
                >
                  <Link href={url}>
                    <Icon />
                    {t(`navigation.${key}`)}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
