"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNav } from "@/hooks/use-nav"
import { client } from "@/lib/auth-client"

export function SecondaryNav() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useExtracted()
  const { secondaryNav } = useNav()

  async function onSignOut() {
    toast.promise(client.signOut(), {
      loading: t("Signing out..."),
      success: () => {
        router.push("/signin")
        return t("You need to sign in again.")
      },
      error: () => t("Failed to sign out! Please try again later."),
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {secondaryNav.map(({ url, icon: Icon, label }) => (
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
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("Sign Out")} onClick={onSignOut}>
              <LogOutIcon />
              {t("Sign Out")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
