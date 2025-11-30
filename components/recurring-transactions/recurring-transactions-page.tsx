"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { RecurringTransactionDialog } from "@/components/recurring-transactions/recurring-transaction-dialog"
import { RecurringTransactionsFilters } from "@/components/recurring-transactions/recurring-transactions-filters"

export default function RecurringTransactionsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useExtracted()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 lg:h-full lg:max-h-[calc(100vh-4.375rem)]">
        <div className="header">
          <div>
            <div className="title">{t("Recurring")}</div>
            <div className="description">
              {t("Manage your recurring transactions.")}
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>{t("Add")}</Button>
        </div>

        <RecurringTransactionsFilters />
      </div>

      <RecurringTransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
