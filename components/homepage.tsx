"use client"

import { Spinner } from "@/components/ui/spinner"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TransactionSummary } from "@/components/dashboard/transaction-summary"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTransactions, useUser } from "@/lib/swr"

export default function HomePage() {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  if (isUserLoading || isTransactionsLoading) {
    return (
      <div className="center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) {
    return <div className="center">Không thể tải thông tin người dùng!</div>
  }

  if (!transactions) {
    return <div className="center">Không thể tải giao dịch!</div>
  }

  return (
    <div className="space-y-4">
      <div ref={registerRef} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Xin chào, {user.fullName}!</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý tài chính cá nhân của bạn.
          </p>
        </div>
        <TransactionDialog />
      </div>

      <div ref={registerRef}>
        <TransactionSummary transactions={transactions} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="[&>div]:h-full [&>div]:overflow-y-auto"
          style={{
            maxHeight: isMobile
              ? "400px"
              : `calc(100vh - 110px - ${calculatedHeight}px)`,
          }}
        >
          <RecentTransactions transactions={transactions} />
        </div>
        <div
          className="[&>div]:h-full [&>div]:overflow-y-auto"
          style={{
            maxHeight: isMobile
              ? "none"
              : `calc(100vh - 110px - ${calculatedHeight}px)`,
          }}
        >
          <QuickStats transactions={transactions} />
        </div>
      </div>
    </div>
  )
}
