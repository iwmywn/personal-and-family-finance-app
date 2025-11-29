"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCategory } from "@/hooks/use-category"
import { useFormatDate } from "@/hooks/use-format-date"
import type { Transaction } from "@/lib/definitions"

interface ExportButtonProps {
  filteredTransactions: Transaction[]
}

export function ExportButton({ filteredTransactions }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const t = useExtracted()
  const formatDate = useFormatDate()
  const { getCategoryLabel } = useCategory()

  function formatTransactionsToCSV(
    filteredTransactions: Transaction[]
  ): string {
    const headers = [
      t("Date"),
      t("Type"),
      t("Category"),
      t("Amount"),
      t("Description"),
    ]
    const rows = filteredTransactions.map((ft) => {
      const date = `"${formatDate(ft.date)}"`
      const type = ft.type === "income" ? t("Income") : t("Expense")
      const amount = ft.amount.toString()
      const description = ft.description.replace(/"/g, '""')
      return [
        date,
        type,
        getCategoryLabel(ft.categoryKey),
        amount,
        `"${description}"`,
      ]
    })

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  }

  function handleExport() {
    if (filteredTransactions.length === 0) {
      toast.error(t("No transactions found"))
      return
    }

    setIsLoading(true)
    try {
      const csvContent = formatTransactionsToCSV(filteredTransactions)
      let dateStr: string = ""

      if (filteredTransactions.length === 1) {
        dateStr = formatDate(filteredTransactions[0].date)
      }
      if (filteredTransactions.length > 1) {
        const firstDate = formatDate(
          filteredTransactions[filteredTransactions.length - 1].date
        )
        const lastDate = formatDate(filteredTransactions[0].date)
        dateStr = `${t("From")}_${firstDate}_${t("To")}_${lastDate}`
      }

      const filename = `${t("transactions")}_${dateStr}.csv`
        .replace(/[, ]+/g, "_")
        .toLowerCase()

      // Add UTF-8 BOM for proper encoding in Excel
      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(t("Export Transactions (CSV)") + " " + filename)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast.error(t("Failed to export data! Please try again later."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={handleExport} disabled={isLoading}>
          {isLoading && <Spinner />}
          {t("Export Transactions")}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t("Export transactions with current filters applied")}
      </TooltipContent>
    </Tooltip>
  )
}
