"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

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
  const t = useTranslations()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 lg:h-full lg:max-h-[calc(100vh-4.375rem)]">
        <div className="header">
          <div>
            <div className="title">{t("navigation.transactions")}</div>
            <div className="description">
              {t("transactions.fe.description")}
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButton filteredTransactions={filteredTransactions} />
            <Button onClick={() => setIsEditOpen(true)}>
              {t("common.fe.add")}
            </Button>
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
