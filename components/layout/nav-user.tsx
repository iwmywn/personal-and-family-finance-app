"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { signOut } from "@/actions/auth"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { secondaryNav } from "@/lib/nav"
import { clearSWRCache } from "@/lib/swr"

export function NavUser() {
  const router = useRouter()
  const pathname = usePathname()
  const tNavigation = useTranslations("navigation")
  const tAuthFe = useTranslations("auth.fe")

  async function onSignOut() {
    toast.promise(signOut(), {
      loading: tAuthFe("signingOut"),
      success: ({ success }) => {
        router.push("/signin")
        setTimeout(() => clearSWRCache(), 3000)
        return success
      },
      error: ({ error }) => error,
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
                tooltip={tNavigation(key)}
                asChild
              >
                <Link href={url}>
                  <Icon />
                  {tNavigation(key)}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={tNavigation("signOut")}
              onClick={onSignOut}
            >
              <LogOut />
              {tNavigation("signOut")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
