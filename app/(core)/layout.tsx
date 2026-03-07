import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getActiveSessions, getCurrentSession } from "@/actions/session.actions"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { UserProvider } from "@/context/user-context"

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
        <div className="bg-primary-foreground border-border h-full max-h-[calc(100vh-1rem)] overflow-y-auto border p-2 pt-0 shadow-sm">
          <Header />
          <section>
            <Suspense
              fallback={
                <div className="center h-[calc(100vh-4.375rem)]">
                  <Spinner className="size-8" />
                </div>
              }
            >
              <DashboardProvider>{children}</DashboardProvider>
            </Suspense>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function DashboardProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [session, activeSessions] = await Promise.all([
    getCurrentSession(),
    getActiveSessions(),
  ])

  if (!session || !activeSessions) {
    redirect("/signin")
  }

  return (
    <UserProvider
      user={session.user}
      currentSession={session.session}
      activeSessions={activeSessions}
    >
      {children}
    </UserProvider>
  )
}
