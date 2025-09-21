"use client"

import Image from "next/image"
import Link from "next/link"
import {
  BadgePlus,
  ChartColumnIncreasing,
  CreditCard,
  Kanban,
} from "lucide-react"

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
    title: "Create Card",
    url: "/create",
    icon: BadgePlus,
  },
  {
    title: "Card Management",
    url: "/management",
    icon: Kanban,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartColumnIncreasing,
  },
  {
    title: "Subscription Plans",
    url: "/subscription",
    icon: CreditCard,
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
        <SidebarMenuButton size="lg" tooltip="iwmywn-pfm Home" asChild>
          <Link href="/home">
            <Image
              src="/images/logo.png"
              alt="iwmywn-pfm Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">PFM</span>
            </div>
          </Link>
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
