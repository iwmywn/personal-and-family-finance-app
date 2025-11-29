"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNav } from "@/hooks/use-nav"

export function MainNav() {
  const pathname = usePathname()
  const { mainNav } = useNav()

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNav.map(({ url, icon: Icon, label }) => (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton
                  isActive={pathname === url}
                  tooltip={label}
                  asChild
                >
                  <Link href={url}>
                    <Icon />
                    {label}
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
