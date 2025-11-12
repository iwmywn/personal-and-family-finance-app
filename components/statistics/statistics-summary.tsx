"use client"

import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
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
  const summaryStats = calculateSummaryStats(filteredTransactions)
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
          <ArrowUpIcon className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-muted-foreground text-sm">
            {incomeCount} {tCommonFE("transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tStatisticsFE("totalExpense")}</CardTitle>
          <ArrowDownIcon className="size-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <div className="text-muted-foreground text-sm">
            {expenseCount} {tCommonFE("transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tStatisticsFE("balance")}</CardTitle>
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
              ? tCommonFE("positive")
              : balance < 0
                ? tCommonFE("negative")
                : tCommonFE("balanced")}{" "}
            {tCommonFE("comparedToIncome")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{tCommonFE("totalTransactions")}</CardTitle>
          <ActivityIcon className="size-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-blue-600">
            {transactionCount}
          </div>
          <div className="text-muted-foreground text-sm">
            {tStatisticsFE("transactionCount")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
