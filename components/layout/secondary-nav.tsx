"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
        return t("Signed out.")
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton tooltip={t("Sign Out")}>
                  <LogOutIcon />
                  {t("Sign Out")}
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("Are you sure you want to sign out?")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      "You will need to sign in again to access your account."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onSignOut}>
                    {t("Sign Out")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
