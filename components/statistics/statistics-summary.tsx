"use client"

import { useMemo } from "react"
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction } from "@/lib/definitions"
import { formatCurrency } from "@/lib/utils/formatting"
import { calculateSummaryStats } from "@/lib/utils/statistics"

interface StatisticsSummaryProps {
  filteredTransactions: Transaction[]
}

export function StatisticsSummary({
  filteredTransactions,
}: StatisticsSummaryProps) {
  const t = useTranslations("statistics")
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
          <CardTitle>{t("totalIncome")}</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-muted-foreground text-sm">
            {incomeCount} {t("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("totalExpense")}</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-muted-foreground text-sm">
            {expenseCount} {t("transactions")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("balance")}</CardTitle>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("transactionCount")}</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-blue-600">
            {transactionCount.toLocaleString("vi-VN")}
          </div>
          <p className="text-muted-foreground text-sm">
            {t("totalTransactions")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
