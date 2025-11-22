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
  const t = useTranslations()
  const {
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    incomeCount,
    expenseCount,
  } = calculateSummaryStats(filteredTransactions)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("statistics.fe.totalIncome")}</CardTitle>
          <ArrowUpIcon className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-muted-foreground text-sm">
            {incomeCount} {t("common.fe.transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("statistics.fe.totalExpense")}</CardTitle>
          <ArrowDownIcon className="size-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <div className="text-muted-foreground text-sm">
            {expenseCount} {t("common.fe.transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("common.fe.balance")}</CardTitle>
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
              ? t("common.fe.positive")
              : balance < 0
                ? t("common.fe.negative")
                : t("common.fe.balanced")}{" "}
            {t("common.fe.comparedToIncome")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("common.fe.totalTransactions")}</CardTitle>
          <ActivityIcon className="size-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-blue-600">
            {transactionCount}
          </div>
          <div className="text-muted-foreground text-sm">
            {t("statistics.fe.transactionCount")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
