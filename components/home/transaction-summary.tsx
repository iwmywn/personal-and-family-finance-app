"use client"

import { useMemo } from "react"
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/helpers/formatting"
import {
  calculateSummaryStats,
  getCurrentMonthTransactions,
} from "@/lib/helpers/statistics"
import { useTransactions } from "@/lib/swr"

export function TransactionSummary() {
  const { transactions } = useTransactions()

  const currentMonthTransactions = getCurrentMonthTransactions(transactions!)

  const summaryStats = useMemo(() => {
    return calculateSummaryStats(currentMonthTransactions)
  }, [currentMonthTransactions])

  const { totalIncome, totalExpense, balance } = summaryStats

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Thu nhập tháng này</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-muted-foreground text-sm">
            {currentMonthTransactions.filter((t) => t.type === "income").length}{" "}
            giao dịch
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Chi tiêu tháng này</CardTitle>
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
            giao dịch
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Số dư tháng này</CardTitle>
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
            {balance > 0 ? "Dương" : balance < 0 ? "Âm" : "Cân bằng"} so với thu
            nhập
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
