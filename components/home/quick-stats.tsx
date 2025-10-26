"use client"

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
import { getCategoryLabel } from "@/lib/helpers/categories"
import { formatCurrency } from "@/lib/helpers/formatting"
import { calculateQuickStats } from "@/lib/helpers/statistics"
import { useCustomCategories, useTransactions } from "@/lib/swr"

interface QuickStatsProps {
  offsetHeight: number
}

export function QuickStats({ offsetHeight }: QuickStatsProps) {
  const isMediumScreens = useMediaQuery("(max-width: 767px)")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const { customCategories } = useCustomCategories()
  const { transactions } = useTransactions()

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
        <CardTitle>Thống kê nhanh</CardTitle>
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
                  <div className="left">Tổng giao dịch:</div>
                  <div className="right">{currentMonthCount}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Tổng số giao dịch (cả thu và chi) bạn đã thực hiện trong tháng
                hiện tại. Giúp theo dõi tần suất giao dịch của bạn.
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">Giao dịch cao nhất:</div>
                  <div className="right">
                    {highestTransaction !== null
                      ? `${formatCurrency(highestTransaction.amount)} (${
                          highestTransaction.type === "income" ? "thu" : "chi"
                        })`
                      : "Chưa có"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Giao dịch có giá trị lớn nhất trong tháng (có thể là thu hoặc
                chi). Giúp nhận diện các khoản tiền lớn bất thường.
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">Giao dịch thấp nhất:</div>
                  <div className="right">
                    {lowestTransaction !== null
                      ? `${formatCurrency(lowestTransaction.amount)} (${
                          lowestTransaction.type === "income" ? "thu" : "chi"
                        })`
                      : "Chưa có"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Giao dịch có giá trị nhỏ nhất trong tháng (có thể là thu hoặc
                chi). Giúp nhận diện các khoản chi nhỏ lẻ thường xuyên.
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">Chi TB/giao dịch:</div>
                  <div className="right">
                    {avgExpense !== null
                      ? formatCurrency(avgExpense)
                      : "Chưa có"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Số tiền trung bình mỗi lần chi tiêu (Tổng chi / Số giao dịch
                chi). Giúp bạn nhận biết quy mô chi tiêu trung bình của mình.
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">Tỷ lệ tiết kiệm:</div>
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
                    {savingsRate !== null ? `${savingsRate}%` : "Chưa có"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Tỷ lệ phần trăm số tiền bạn tiết kiệm được so với thu nhập ((Thu
                - Chi) / Thu × 100%). Tỷ lệ càng cao càng tốt, nên duy trì trên
                20%.
              </TooltipContent>
            </Tooltip>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="row">
                  <div className="left">Danh mục phổ biến:</div>
                  <div className="right">
                    {popularCategory.length > 0
                      ? popularCategory
                          .map((key) => getCategoryLabel(key, customCategories))
                          .join(", ")
                      : "Chưa có"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Các danh mục có tổng số tiền cao nhất trong tháng. Giúp bạn nhận
                biết lĩnh vực chi tiêu hoặc nguồn thu lớn nhất của mình.
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
