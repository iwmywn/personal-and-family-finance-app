"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { BasePage } from "@/components/layout/base-page"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"

export default function TransactionsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">Giao dịch</div>
            <div className="description">
              Quản lý tất cả giao dịch thu chi của bạn.
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Thêm</Button>
        </div>

        <TransactionFilters />
      </BasePage>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
