import { Suspense } from "react"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { getUser } from "@/actions/auth"
import { getBudgets } from "@/actions/budgets"
import { getCustomCategories } from "@/actions/categories"
import { getTransactions } from "@/actions/transactions"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { AppDataProvider } from "@/lib/app-data-context"
import { session } from "@/lib/session"

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
          className="bg-primary-foreground border-border h-full overflow-y-auto rounded-(--radius) border p-2 pt-0 shadow-sm"
          style={{ maxHeight: "calc(100vh - 1rem)" }}
        >
          <Header />
          <section
            id="page-content"
            className="h-full"
            style={{ maxHeight: "calc(100vh - 4.375rem)" }}
          >
            <Suspense
              fallback={
                <div className="center">
                  <Spinner className="size-8" />
                </div>
              }
            >
              <Layout>{children}</Layout>
            </Suspense>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId } = await session.user.get()

  const [tCommonBE, tAuthBE, tTransactionsBE, tCategoriesBE, tBudgetsBE] =
    await Promise.all([
      getTranslations("common.be"),
      getTranslations("auth.be"),
      getTranslations("transactions.be"),
      getTranslations("categories.be"),
      getTranslations("budgets.be"),
    ])

  const [userResult, transactionsResult, categoriesResult, budgetsResult] =
    await Promise.all([
      getUser(userId, tCommonBE, tAuthBE),
      getTransactions(userId, tCommonBE, tTransactionsBE),
      getCustomCategories(userId, tCommonBE, tCategoriesBE),
      getBudgets(userId, tCommonBE, tBudgetsBE),
    ])

  const user = userResult.user || null
  const transactions = transactionsResult.transactions || []
  const customCategories = categoriesResult.customCategories || []
  const budgets = budgetsResult.budgets || []

  return (
    <AppDataProvider
      user={user}
      transactions={transactions}
      customCategories={customCategories}
      budgets={budgets}
    >
      {children}
    </AppDataProvider>
  )
}
