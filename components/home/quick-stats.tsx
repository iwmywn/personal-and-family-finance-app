"use client"

import { useExtracted } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useMediaQuery } from "@/hooks/use-media-query"
import { calculateQuickStats } from "@/lib/statistics"
import { formatCurrency } from "@/lib/utils"

interface QuickStatsProps {
  offsetHeight: number
}

export function QuickStats({ offsetHeight }: QuickStatsProps) {
  const isMediumScreens = useMediaQuery("(max-width: 767px)")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const { transactions } = useAppData()
  const t = useExtracted()
  const { getCategoryLabel } = useCategory()

  const {
    currentMonthCount,
    highestTransaction,
    lowestTransaction,
    avgExpense,
    savingsRate,
    popularCategory,
  } = calculateQuickStats(transactions)

  return (
    <Card className="relative overflow-hidden py-0 pb-6">
      <CardHeader ref={registerRef} className="bg-card sticky top-0 pt-6">
        <CardTitle>{t("Quick Stats")}</CardTitle>
      </CardHeader>
      <CardContent
        className="h-full overflow-y-auto"
        style={{
          maxHeight: isMediumScreens
            ? "fit-content"
            : `calc(100vh - 9.5rem - ${offsetHeight}px - ${calculatedHeight}px)`,
        }}
      >
        <div id="quick-stats-content" className="space-y-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("Total Transactions")}:</div>
                <div className="right">{currentMonthCount}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t(
                "Total number of transactions (both income and expenses) you have made."
              )}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("Highest Transaction")}:</div>
                <div
                  className={`right ${
                    highestTransaction !== null
                      ? highestTransaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                      : ""
                  }`}
                >
                  {highestTransaction !== null
                    ? `${highestTransaction.type === "income" ? "+" : "-"}${formatCurrency(highestTransaction.amount)}`
                    : t("No data")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t(
                "Transaction with the highest value in the month (can be income or expense)."
              )}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("Lowest Transaction")}:</div>
                <div
                  className={`right ${
                    lowestTransaction !== null
                      ? lowestTransaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                      : ""
                  }`}
                >
                  {lowestTransaction !== null
                    ? `${lowestTransaction.type === "income" ? "+" : "-"}${formatCurrency(lowestTransaction.amount)}`
                    : t("No data")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t(
                "Transaction with the lowest value in the month (can be income or expense)."
              )}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("Average Expense")}:</div>
                <div className="right">
                  {avgExpense !== null
                    ? formatCurrency(avgExpense)
                    : t("No data")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t(
                "Average amount per expense (Total Expense / Number of expense transactions)."
              )}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("Savings Rate")}:</div>
                <div
                  className={`right ${
                    savingsRate !== null
                      ? parseFloat(savingsRate) > 0
                        ? "text-green-600"
                        : parseFloat(savingsRate) < 0
                          ? "text-red-600"
                          : ""
                      : ""
                  } `}
                >
                  {savingsRate !== null ? `${savingsRate}%` : t("No data")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t(
                "The percentage of money you save compared to income ((Income - Expense) / Income × 100%)."
              )}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("Popular Category")}:</div>
                <div className="right">
                  {popularCategory.length > 0
                    ? popularCategory
                        .map((key) => getCategoryLabel(key))
                        .join(", ")
                    : t("No data")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t("Category with the highest number of transactions.")}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
