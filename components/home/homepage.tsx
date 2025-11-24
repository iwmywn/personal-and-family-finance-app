"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { QuickStats } from "@/components/home/quick-stats"
import { RecentTransactions } from "@/components/home/recent-transactions"
import { TransactionSummary } from "@/components/home/transaction-summary"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useAppData } from "@/context/app-data-context"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"

export default function HomePage() {
  const { user } = useAppData()
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 md:h-full md:max-h-[calc(100vh-4.375rem)]">
        <div ref={registerRef} className="header">
          <div>
            <div className="title">
              {t("home.fe.welcome")}, {user.name}!
            </div>
            <div className="description">{t("home.fe.description")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {t("common.fe.add")}
          </Button>
        </div>

        <div ref={registerRef}>
          <TransactionSummary />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RecentTransactions offsetHeight={calculatedHeight} />
          <QuickStats offsetHeight={calculatedHeight} />
        </div>
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
