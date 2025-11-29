"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { ExportButton } from "@/components/transactions/export-button"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import type { Transaction } from "@/lib/definitions"

export default function TransactionsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([])
  const t = useExtracted()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 lg:h-full lg:max-h-[calc(100vh-4.375rem)]">
        <div className="header">
          <div>
            <div className="title">{t("Transactions")}</div>
            <div className="description">
              {t("Manage income and expenses to track your personal finances.")}
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButton filteredTransactions={filteredTransactions} />
            <Button onClick={() => setIsEditOpen(true)}>{t("Add")}</Button>
          </div>
        </div>

        <TransactionFilters
          onFilteredTransactionsChange={setFilteredTransactions}
        />
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
