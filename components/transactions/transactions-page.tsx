"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { BasePage } from "@/components/layout/base-page"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"

export default function TransactionsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tTransactions = useTranslations("transactions")

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">{tTransactions("title")}</div>
            <div className="description">
              {tTransactions("pageDescription")}
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {tTransactions("add")}
          </Button>
        </div>

        <TransactionFilters />
      </BasePage>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
