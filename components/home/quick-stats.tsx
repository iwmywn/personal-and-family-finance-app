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
import { getCategoryLabel } from "@/lib/categories"
import { calculateQuickStats } from "@/lib/statistics"
import { useCustomCategories, useTransactions } from "@/lib/swr"
import { formatCurrency } from "@/lib/utils"

interface QuickStatsProps {
  offsetHeight: number
}

export function QuickStats({ offsetHeight }: QuickStatsProps) {
  const isMediumScreens = useMediaQuery("(max-width: 767px)")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const { customCategories } = useCustomCategories()
  const { transactions } = useTransactions()
  const tHome = useTranslations("home")

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
        <CardTitle>{tHome("quickStats")}</CardTitle>
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
                  <div className="left">{tHome("totalTransactions")}:</div>
                  <div className="right">{currentMonthCount}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {tHome("totalTransactionsTooltip")}
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{tHome("highestTransaction")}:</div>
                  <div className="right">
                    {highestTransaction !== null
                      ? `${formatCurrency(highestTransaction.amount)} (${
                          highestTransaction.type === "income"
                            ? tHome("income")
                            : tHome("expense")
                        })`
                      : tHome("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {tHome("highestTransactionTooltip")}
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{tHome("lowestTransaction")}:</div>
                  <div className="right">
                    {lowestTransaction !== null
                      ? `${formatCurrency(lowestTransaction.amount)} (${
                          lowestTransaction.type === "income"
                            ? tHome("income")
                            : tHome("expense")
                        })`
                      : tHome("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {tHome("lowestTransactionTooltip")}
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{tHome("avgExpense")}:</div>
                  <div className="right">
                    {avgExpense !== null
                      ? formatCurrency(avgExpense)
                      : tHome("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{tHome("avgExpenseTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{tHome("savingsRate")}:</div>
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
                    {savingsRate !== null ? `${savingsRate}%` : tHome("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{tHome("savingsRateTooltip")}</TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">{tHome("popularCategory")}:</div>
                  <div className="right">
                    {popularCategory.length > 0
                      ? popularCategory
                          .map((key) => getCategoryLabel(key, customCategories))
                          .join(", ")
                      : tHome("noData")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{tHome("popularCategoryTooltip")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
