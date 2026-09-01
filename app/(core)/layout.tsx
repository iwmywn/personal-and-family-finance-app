import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { getActiveSessions, getCurrentSession } from "@/actions/session.actions"
import Loading from "@/app/(core)/loading"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { UserProvider } from "@/context/user-context"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [cookieStore, session, activeSessions] = await Promise.all([
    cookies(),
    getCurrentSession(),
    getActiveSessions(),
  ])
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  if (!session || !activeSessions) {
    redirect("/signin")
  }

  return (
    <NuqsAdapter>
      <TooltipProvider>
        <UserProvider
          user={session.user}
          currentSession={session.session}
          activeSessions={activeSessions}
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset className="p-2 peer-data-[state=collapsed]:pl-0 md:peer-data-[state=collapsed]:max-w-[calc(100vw-4rem)] md:peer-data-[state=expanded]:max-w-[calc(100vw-16rem)] md:peer-data-[state=expanded]:transition-[max-width] md:peer-data-[state=expanded]:duration-500">
              <div className="bg-primary-foreground border-border h-full max-h-[calc(100vh-1rem)] overflow-y-auto border p-2 pt-0 shadow-sm">
                <Header />
                <section className="md:h-full md:max-h-[calc(100vh-4.375rem)]">
                  <Suspense fallback={<Loading />}>{children}</Suspense>
                </section>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </UserProvider>
      </TooltipProvider>
    </NuqsAdapter>
  )
}
