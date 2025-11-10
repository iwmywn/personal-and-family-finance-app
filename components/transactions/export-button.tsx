"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useFormatDate } from "@/hooks/use-format-date"
import { useAppData } from "@/lib/app-data-context"
import type { Transaction } from "@/lib/definitions"

interface ExportButtonProps {
  filteredTransactions: Transaction[]
}

export function ExportButton({ filteredTransactions }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const tCommonFE = useTranslations("common.fe")
  const formatDate = useFormatDate()
  const { getCategoryLabel } = useCategoryI18n()
  const { customCategories } = useAppData()

  function formatTransactionsToCSV(
    filteredTransactions: Transaction[]
  ): string {
    const headers = [
      tCommonFE("date"),
      tCommonFE("type"),
      tCommonFE("category"),
      tCommonFE("amount"),
      tCommonFE("description"),
    ]
    const rows = filteredTransactions.map((t) => {
      const date = `"${formatDate(t.date)}"`
      const type =
        t.type === "income" ? tCommonFE("income") : tCommonFE("expense")
      const amount = t.amount.toString()
      const description = t.description.replace(/"/g, '""')
      return [
        date,
        type,
        getCategoryLabel(t.categoryKey, customCategories),
        amount,
        `"${description}"`,
      ]
    })

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  }

  function handleExport() {
    if (filteredTransactions.length === 0) {
      toast.error(tCommonFE("noTransactionsFound"))
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
        dateStr = `${tCommonFE("from")}_${firstDate}_${tCommonFE("to")}_${lastDate}`
      }

      const filename = `${tCommonFE("transactions")}_${dateStr}.csv`
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

      toast.success(tCommonFE("exportCsv") + " " + filename)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast.error(tCommonFE("transactionsExportFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={handleExport} disabled={isLoading}>
          {isLoading && <Spinner />}
          {tCommonFE("exportTransactions")}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tCommonFE("exportWithFilters")}</TooltipContent>
    </Tooltip>
  )
}
