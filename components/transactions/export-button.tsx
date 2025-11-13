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
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useFormatDate } from "@/hooks/use-format-date"
import type { Transaction } from "@/lib/definitions"

interface ExportButtonProps {
  filteredTransactions: Transaction[]
}

export function ExportButton({ filteredTransactions }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const t = useTranslations()
  const formatDate = useFormatDate()
  const { getCategoryLabel } = useCategoryI18n()
  const { customCategories } = useAppData()

  function formatTransactionsToCSV(
    filteredTransactions: Transaction[]
  ): string {
    const headers = [
      t("common.fe.date"),
      t("common.fe.type"),
      t("common.fe.category"),
      t("common.fe.amount"),
      t("common.fe.description"),
    ]
    const rows = filteredTransactions.map((ft) => {
      const date = `"${formatDate(ft.date)}"`
      const type =
        ft.type === "income" ? t("common.fe.income") : t("common.fe.expense")
      const amount = ft.amount.toString()
      const description = ft.description.replace(/"/g, '""')
      return [
        date,
        type,
        getCategoryLabel(ft.categoryKey, customCategories),
        amount,
        `"${description}"`,
      ]
    })

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  }

  function handleExport() {
    if (filteredTransactions.length === 0) {
      toast.error(t("common.fe.noTransactionsFound"))
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
        dateStr = `${t("common.fe.from")}_${firstDate}_${t("common.fe.to")}_${lastDate}`
      }

      const filename = `${t("common.fe.transactions")}_${dateStr}.csv`
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

      toast.success(t("common.fe.exportCsv") + " " + filename)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast.error(t("common.fe.transactionsExportFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={handleExport} disabled={isLoading}>
          {isLoading && <Spinner />}
          {t("common.fe.exportTransactions")}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("common.fe.exportWithFilters")}</TooltipContent>
    </Tooltip>
  )
}
