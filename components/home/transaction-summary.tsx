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
  const tHome = useTranslations("home")

  const currentMonthTransactions = getCurrentMonthTransactions(transactions!)

  const summaryStats = useMemo(() => {
    return calculateSummaryStats(currentMonthTransactions)
  }, [currentMonthTransactions])

  const { totalIncome, totalExpense, balance } = summaryStats

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tHome("monthlyIncome")}</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-muted-foreground text-sm">
            {
              currentMonthTransactions.filter(
                (tHome) => tHome.type === "income"
              ).length
            }{" "}
            {tHome("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tHome("monthlyExpense")}</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-muted-foreground text-sm">
            {
              currentMonthTransactions.filter(
                (tHome) => tHome.type === "expense"
              ).length
            }{" "}
            {tHome("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tHome("monthlyBalance")}</CardTitle>
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
              ? tHome("positive")
              : balance < 0
                ? tHome("negative")
                : tHome("balanced")}{" "}
            {tHome("comparedToIncome")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
