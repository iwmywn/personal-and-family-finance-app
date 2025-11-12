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
  const tTransactionsFE = useTranslations("transactions.fe")
  const tCommonFE = useTranslations("common.fe")
  const tNavigation = useTranslations("navigation")

  return (
    <>
      <div className="header">
        <div>
          <div className="title">{tNavigation("transactions")}</div>
          <div className="description">{tTransactionsFE("description")}</div>
        </div>
        <div className="flex gap-2">
          <ExportButton filteredTransactions={filteredTransactions} />
          <Button onClick={() => setIsEditOpen(true)}>
            {tCommonFE("add")}
          </Button>
        </div>
      </div>

      <TransactionFilters
        onFilteredTransactionsChange={setFilteredTransactions}
      />

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
