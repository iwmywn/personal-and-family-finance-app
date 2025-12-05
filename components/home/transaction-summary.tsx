"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useExtracted } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppData } from "@/context/app-data-context"
import {
  calculateSummaryStats,
  getCurrentMonthTransactions,
} from "@/lib/statistics"
import { formatCurrency } from "@/lib/utils"

export function TransactionSummary() {
  const { transactions } = useAppData()
  const t = useExtracted()

  const currentMonthTransactions = getCurrentMonthTransactions(transactions)

  const { totalIncome, totalExpense, balance } = calculateSummaryStats(
    currentMonthTransactions
  )

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Monthly Income")}</CardTitle>
          <ArrowUpIcon className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-muted-foreground text-sm">
            {
              currentMonthTransactions.filter(
                (tHomeFE) => tHomeFE.type === "income"
              ).length
            }{" "}
            {t("transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Monthly Expense")}</CardTitle>
          <ArrowDownIcon className="size-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <div className="text-muted-foreground text-sm">
            {
              currentMonthTransactions.filter(
                (tHomeFE) => tHomeFE.type === "expense"
              ).length
            }{" "}
            {t("transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Monthly Balance")}</CardTitle>
          {balance >= 0 ? (
            <TrendingUpIcon className="size-4 text-green-600" />
          ) : (
            <TrendingDownIcon className="size-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl wrap-anywhere ${
              balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : ""
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <div className="text-muted-foreground text-sm">
            {balance > 0
              ? t("Positive")
              : balance < 0
                ? t("Negative")
                : t("Balanced")}{" "}
            {t("compared to income")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
