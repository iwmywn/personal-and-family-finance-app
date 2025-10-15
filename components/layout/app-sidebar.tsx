"use client"

import Image from "next/image"
import { ChartColumnIncreasing, Home, Wallet } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Nav } from "@/components/layout/nav"
import { NavUser } from "@/components/layout/nav-user"

export const nav = [
  {
    title: "Trang chủ",
    url: "/home",
    icon: Home,
  },
  {
    title: "Thống kê",
    url: "/statistics",
    icon: ChartColumnIncreasing,
  },
  {
    title: "Giao dịch",
    url: "/transactions",
    icon: Wallet,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="pr-0 group-data-[state=collapsed]:pr-[0.5625rem]"
      variant="floating"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenuButton size="lg" tooltip="Quản Lý Tài Chính Cá Nhân">
          <Image
            src="/images/logo.png"
            alt="iwmywn-pfm Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              Quản Lý Tài Chính Cá Nhân
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <Nav nav={nav} />
      </SidebarContent>
      <SidebarFooter className="p-0">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
