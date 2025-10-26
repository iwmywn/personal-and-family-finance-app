"use client"

import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useCustomCategories, useTransactions } from "@/lib/swr"
import { getCategoryLabel } from "@/lib/utils/categories"
import { formatCurrency } from "@/lib/utils/formatting"
import { calculateQuickStats } from "@/lib/utils/statistics"

interface QuickStatsProps {
  offsetHeight: number
}

export function QuickStats({ offsetHeight }: QuickStatsProps) {
  const isMediumScreens = useMediaQuery("(max-width: 767px)")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const { customCategories } = useCustomCategories()
  const { transactions } = useTransactions()
  const t = useTranslations("home")

  const {
    currentMonthCount,
    highestTransaction,
    lowestTransaction,
    avgExpense,
    savingsRate,
    popularCategory,
  } = calculateQuickStats(transactions!)

  return (
    <Card className="relative overflow-hidden py-0 pb-6">
      <CardHeader ref={registerRef} className="bg-card sticky top-0 pt-6">
        <CardTitle>{t("quickStats")}</CardTitle>
      </CardHeader>
      <CardContent
        className="h-full overflow-y-auto"
        style={{
          maxHeight: isMediumScreens
            ? "fit-content"
            : `calc(100vh - 9.5rem - ${offsetHeight}px - ${calculatedHeight}px)`,
        }}
      >
        <TooltipProvider>
          <div id="quick-stats-content" className="space-y-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{t("totalTransactions")}:</div>
                  <div className="right">{currentMonthCount}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("totalTransactionsTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{t("highestTransaction")}:</div>
                  <div className="right">
                    {highestTransaction !== null
                      ? `${formatCurrency(highestTransaction.amount)} (${
                          highestTransaction.type === "income"
                            ? t("income")
                            : t("expense")
                        })`
                      : t("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("highestTransactionTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{t("lowestTransaction")}:</div>
                  <div className="right">
                    {lowestTransaction !== null
                      ? `${formatCurrency(lowestTransaction.amount)} (${
                          lowestTransaction.type === "income"
                            ? t("income")
                            : t("expense")
                        })`
                      : t("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("lowestTransactionTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{t("avgExpense")}:</div>
                  <div className="right">
                    {avgExpense !== null
                      ? formatCurrency(avgExpense)
                      : t("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("avgExpenseTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{t("savingsRate")}:</div>
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
                    {savingsRate !== null ? `${savingsRate}%` : t("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("savingsRateTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{t("popularCategory")}:</div>
                  <div className="right">
                    {popularCategory.length > 0
                      ? popularCategory
                          .map((key) => getCategoryLabel(key, customCategories))
                          .join(", ")
                      : t("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("popularCategoryTooltip")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
