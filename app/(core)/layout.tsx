import { cookies } from "next/headers"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="p-2 peer-data-[state=collapsed]:pl-0 md:peer-data-[state=collapsed]:max-w-[calc(100vw-4rem)] md:peer-data-[state=expanded]:max-w-[calc(100vw-16rem)] md:peer-data-[state=expanded]:transition-[max-width] md:peer-data-[state=expanded]:duration-500">
        <div
          className="bg-primary-foreground border-border h-full overflow-y-auto rounded-[var(--radius)] border p-2 pt-0 shadow-sm"
          style={{ maxHeight: "calc(100vh - 1rem)" }}
        >
          <Header />
          <section
            className="h-full"
            style={{ maxHeight: "calc(100vh - 4.85rem)" }}
          >
            {children}
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
