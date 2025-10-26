"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
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
import { clearSWRCache } from "@/lib/swr"

export function NavUser() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("navigation")

  async function onSignOut() {
    const { success, error } = await signOut()

    if (error || !success) {
      toast.error(error)
    } else {
      toast.success(success)
      router.push("/signin")
      setTimeout(() => clearSWRCache(), 3000)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/settings"}
              tooltip={t("settings")}
              asChild
            >
              <Link href="/settings">
                <Settings />
                {t("settings")}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t("signOut")} onClick={onSignOut}>
              <LogOut />
              {t("signOut")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
