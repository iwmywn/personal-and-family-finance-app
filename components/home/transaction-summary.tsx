"use client"

import { useMemo } from "react"
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  calculateSummaryStats,
  getCurrentMonthTransactions,
} from "@/lib/statistics"
import { useTransactions } from "@/lib/swr"
import { formatCurrency } from "@/lib/utils"

export function TransactionSummary() {
  const { transactions } = useTransactions()
  const t = useTranslations("home")

  const currentMonthTransactions = getCurrentMonthTransactions(transactions!)

  const summaryStats = useMemo(() => {
    return calculateSummaryStats(currentMonthTransactions)
  }, [currentMonthTransactions])

  const { totalIncome, totalExpense, balance } = summaryStats

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("monthlyIncome")}</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-muted-foreground text-sm">
            {currentMonthTransactions.filter((t) => t.type === "income").length}{" "}
            {t("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("monthlyExpense")}</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-muted-foreground text-sm">
            {
              currentMonthTransactions.filter((t) => t.type === "expense")
                .length
            }{" "}
            {t("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("monthlyBalance")}</CardTitle>
          <TrendingUpIcon
            className={`h-4 w-4 ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl wrap-anywhere ${
              balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : ""
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-muted-foreground text-sm">
            {balance > 0
              ? t("positive")
              : balance < 0
                ? t("negative")
                : t("balanced")}{" "}
            {t("comparedToIncome")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
