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
import { getCategoryLabel } from "@/lib/categories"
import type { Transaction, TransactionCategory } from "@/lib/definitions"
import { formatCurrency, isCurrentMonth } from "@/lib/utils"

interface QuickStatsProps {
  transactions: Transaction[]
  offsetHeight: number
}

export function QuickStats({ transactions, offsetHeight }: QuickStatsProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  const currentMonthTransactions = transactions.filter((t) =>
    isCurrentMonth(t.date)
  )

  // Tổng giao dịch:
  const currentMonthCount = currentMonthTransactions.length

  // Giao dịch cao nhất:
  const highestTransaction =
    currentMonthTransactions.length > 0
      ? currentMonthTransactions.reduce((max, t) =>
          t.amount > max.amount ? t : max
        )
      : null

  // Giao dịch thấp nhất:
  const lowestTransaction =
    currentMonthTransactions.length > 0
      ? currentMonthTransactions.reduce((min, t) =>
          t.amount < min.amount ? t : min
        )
      : null

  // Chi TB/giao dịch:
  const expenseTransactions = currentMonthTransactions.filter(
    (t) => t.type === "expense"
  )
  const avgExpense =
    expenseTransactions.length > 0
      ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) /
        expenseTransactions.length
      : null

  // Tỷ lệ tiết kiệm:
  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpense = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = monthlyIncome - monthlyExpense
  const savingsRate =
    monthlyIncome > 0
      ? Number(((balance / monthlyIncome) * 100).toFixed(1)).toLocaleString(
          "fullwide",
          { useGrouping: false }
        )
      : null

  // Danh mục phổ biến:
  const popularCategory: TransactionCategory | null =
    currentMonthTransactions.length > 0
      ? (Object.entries(
          currentMonthTransactions.reduce(
            (acc, t) => {
              acc[t.category] = (acc[t.category] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )
        ).sort(([, a], [, b]) => b - a)[0]?.[0] as TransactionCategory)
      : null

  return (
    <Card className="relative overflow-hidden py-0 pb-6">
      <CardHeader ref={registerRef} className="bg-card sticky top-0 pt-6">
        <CardTitle>Thống kê nhanh</CardTitle>
      </CardHeader>
      <CardContent
        className="h-full overflow-y-auto"
        style={{
          maxHeight: isMobile
            ? "fit-content"
            : `calc(100vh - 10rem - ${offsetHeight}px - ${calculatedHeight}px)`,
        }}
      >
        <TooltipProvider>
          <div className="space-y-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Tổng giao dịch:
                  </span>
                  <span className="text-sm">{currentMonthCount}</span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Giao dịch cao nhất:
                  </span>
                  <span className="max-w-1/4 text-sm wrap-anywhere">
                    {highestTransaction !== null
                      ? `${formatCurrency(highestTransaction.amount)} (${
                          highestTransaction.type === "income" ? "thu" : "chi"
                        })`
                      : "Chưa có"}
                  </span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Giao dịch thấp nhất:
                  </span>
                  <span className="max-w-1/4 text-sm wrap-anywhere">
                    {lowestTransaction !== null
                      ? `${formatCurrency(lowestTransaction.amount)} (${
                          lowestTransaction.type === "income" ? "thu" : "chi"
                        })`
                      : "Chưa có"}
                  </span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Chi TB/giao dịch:
                  </span>
                  <span className="max-w-1/4 text-sm wrap-anywhere">
                    {avgExpense !== null
                      ? formatCurrency(avgExpense)
                      : "Chưa có"}
                  </span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Tỷ lệ tiết kiệm:
                  </span>
                  <span
                    className={`max-w-1/4 text-sm wrap-anywhere ${
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
                  </span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Danh mục phổ biến:
                  </span>
                  <span className="text-sm">
                    {popularCategory
                      ? getCategoryLabel(popularCategory)
                      : "Chưa có"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Danh mục có số lượng giao dịch nhiều nhất trong tháng. Giúp bạn
                nhận biết lĩnh vực chi tiêu hoặc thu nhập chính của mình.
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
