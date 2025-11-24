"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { client } from "@/lib/auth-client"
import { secondaryNav } from "@/lib/nav"

export function SecondaryNav() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()

  async function onSignOut() {
    toast.promise(client.signOut(), {
      loading: t("auth.fe.signingOut"),
      success: () => {
        router.push("/signin")
        return t("auth.be.signOutSuccess")
      },
      error: () => t("auth.be.signOutFailed"),
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {secondaryNav.map(({ key, url, icon: Icon }) => (
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
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("navigation.signOut")}
              onClick={onSignOut}
            >
              <LogOutIcon />
              {t("navigation.signOut")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
