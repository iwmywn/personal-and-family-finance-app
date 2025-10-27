"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { BasePage } from "@/components/layout/base-page"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"

export default function TransactionsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tTransactionsFE = useTranslations("transactions.fe")
  const tCommonFE = useTranslations("common.fe")

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">{tTransactionsFE("title")}</div>
            <div className="description">{tTransactionsFE("description")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {tCommonFE("add")}
          </Button>
        </div>

        <TransactionFilters />
      </BasePage>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
