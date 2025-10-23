"use client"

import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StatisticsSummaryProps {
  stats: {
    income: number
    expenses: number
    netWorth: number
    transactionCount: number
    incomeCount: number
    expenseCount: number
  }
}

export function StatisticsSummary({ stats }: StatisticsSummaryProps) {
  const {
    income,
    expenses,
    netWorth,
    transactionCount,
    incomeCount,
    expenseCount,
  } = stats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Tổng thu nhập</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(income)}
          </div>
          <p className="text-muted-foreground text-sm">
            {incomeCount} giao dịch
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Tổng chi tiêu</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(expenses)}
          </div>
          <p className="text-muted-foreground text-sm">
            {expenseCount} giao dịch
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Số dư</CardTitle>
          <TrendingUpIcon
            className={`h-4 w-4 ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl wrap-anywhere ${
              netWorth > 0
                ? "text-green-600"
                : netWorth < 0
                  ? "text-red-600"
                  : ""
            }`}
          >
            {formatCurrency(netWorth)}
          </div>
          <p className="text-muted-foreground text-sm">
            {netWorth > 0 ? "Dương" : netWorth < 0 ? "Âm" : "Cân bằng"} so với
            thu nhập
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Số giao dịch</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-blue-600">
            {transactionCount.toLocaleString("vi-VN")}
          </div>
          <p className="text-muted-foreground text-sm">Tổng số giao dịch</p>
        </CardContent>
      </Card>
    </div>
  )
}
