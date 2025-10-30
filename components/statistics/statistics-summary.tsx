"use client"

import { useMemo } from "react"
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Transaction } from "@/lib/definitions"
import { calculateSummaryStats } from "@/lib/statistics"
import { formatCurrency } from "@/lib/utils"

interface StatisticsSummaryProps {
  filteredTransactions: Transaction[]
}

export function StatisticsSummary({
  filteredTransactions,
}: StatisticsSummaryProps) {
  const tStatisticsFE = useTranslations("statistics.fe")
  const tCommonFE = useTranslations("common.fe")
  const summaryStats = useMemo(() => {
    return calculateSummaryStats(filteredTransactions)
  }, [filteredTransactions])
  const {
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    incomeCount,
    expenseCount,
  } = summaryStats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tStatisticsFE("totalIncome")}</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-muted-foreground text-sm">
            {incomeCount} {tCommonFE("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tStatisticsFE("totalExpense")}</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-muted-foreground text-sm">
            {expenseCount} {tCommonFE("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tStatisticsFE("balance")}</CardTitle>
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
              ? tCommonFE("positive")
              : balance < 0
                ? tCommonFE("negative")
                : tCommonFE("balanced")}{" "}
            {tCommonFE("comparedToIncome")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tStatisticsFE("transactionCount")}</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-blue-600">
            {transactionCount.toLocaleString("vi-VN")}
          </div>
          <p className="text-muted-foreground text-sm">
            {tCommonFE("totalTransactions")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
