"use client"

import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
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
  const t = useTranslations()
  const { getCategoryLabel } = useCategoryI18n()

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
        <CardTitle>{t("home.fe.quickStats")}</CardTitle>
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
                <div className="left">{t("common.fe.totalTransactions")}:</div>
                <div className="right">{currentMonthCount}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t("home.fe.totalTransactionsTooltip")}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("home.fe.highestTransaction")}:</div>
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
                    : t("common.fe.noData")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t("home.fe.highestTransactionTooltip")}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("home.fe.lowestTransaction")}:</div>
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
                    : t("common.fe.noData")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t("home.fe.lowestTransactionTooltip")}
            </TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("home.fe.avgExpense")}:</div>
                <div className="right">
                  {avgExpense !== null
                    ? formatCurrency(avgExpense)
                    : t("common.fe.noData")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>{t("home.fe.avgExpenseTooltip")}</TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("home.fe.savingsRate")}:</div>
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
                  {savingsRate !== null
                    ? `${savingsRate}%`
                    : t("common.fe.noData")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>{t("home.fe.savingsRateTooltip")}</TooltipContent>
          </Tooltip>

          <Separator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="row">
                <div className="left">{t("home.fe.popularCategory")}:</div>
                <div className="right">
                  {popularCategory.length > 0
                    ? popularCategory
                        .map((key) => getCategoryLabel(key))
                        .join(", ")
                    : t("common.fe.noData")}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {t("home.fe.popularCategoryTooltip")}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
