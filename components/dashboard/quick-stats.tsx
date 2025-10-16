"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getCategoryLabel } from "@/lib/categories"
import type { Transaction, TransactionCategory } from "@/lib/definitions"
import { formatCurrency, isCurrentMonth } from "@/lib/utils"

interface QuickStatsProps {
  transactions: Transaction[]
}

export function QuickStats({ transactions }: QuickStatsProps) {
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
    monthlyIncome > 0 ? ((balance / monthlyIncome) * 100).toFixed(1) : null

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
    <Card className="relative py-0 pb-6">
      <CardHeader className="sticky top-0 bg-card pt-6">
        <CardTitle>Thống kê nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tổng giao dịch:
                  </span>
                  <span className="text-sm font-medium">
                    {currentMonthCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-center"
                style={{ maxWidth: "calc(100vw - 100px)" }}
              >
                Tổng số giao dịch (cả thu và chi) bạn đã thực hiện trong tháng
                hiện tại. Giúp theo dõi tần suất giao dịch của bạn.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Giao dịch cao nhất:
                  </span>
                  <span className="text-sm font-medium">
                    {highestTransaction !== null
                      ? `${formatCurrency(highestTransaction.amount)} (${
                          highestTransaction.type === "income" ? "thu" : "chi"
                        })`
                      : "Chưa có"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-center"
                style={{ maxWidth: "calc(100vw - 100px)" }}
              >
                Giao dịch có giá trị lớn nhất trong tháng (có thể là thu hoặc
                chi). Giúp nhận diện các khoản tiền lớn bất thường.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Giao dịch thấp nhất:
                  </span>
                  <span className="text-sm font-medium">
                    {lowestTransaction !== null
                      ? `${formatCurrency(lowestTransaction.amount)} (${
                          lowestTransaction.type === "income" ? "thu" : "chi"
                        })`
                      : "Chưa có"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-center"
                style={{ maxWidth: "calc(100vw - 100px)" }}
              >
                Giao dịch có giá trị nhỏ nhất trong tháng (có thể là thu hoặc
                chi). Giúp nhận diện các khoản chi nhỏ lẻ thường xuyên.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Chi TB/giao dịch:
                  </span>
                  <span className="text-sm font-medium">
                    {avgExpense !== null
                      ? formatCurrency(avgExpense)
                      : "Chưa có"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-center"
                style={{ maxWidth: "calc(100vw - 100px)" }}
              >
                Số tiền trung bình mỗi lần chi tiêu (Tổng chi / Số giao dịch
                chi). Giúp bạn nhận biết quy mô chi tiêu trung bình của mình.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tỷ lệ tiết kiệm:
                  </span>
                  <span
                    className={`text-sm font-medium 
                      ${
                        savingsRate !== null
                          ? parseFloat(savingsRate) > 0
                            ? "text-green-600"
                            : parseFloat(savingsRate) < 0
                              ? "text-red-600"
                              : ""
                          : ""
                      }
                    `}
                  >
                    {savingsRate !== null ? `${savingsRate}%` : "Chưa có"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-center"
                style={{ maxWidth: "calc(100vw - 100px)" }}
              >
                Tỷ lệ phần trăm số tiền bạn tiết kiệm được so với thu nhập ((Thu
                - Chi) / Thu × 100%). Tỷ lệ càng cao càng tốt, nên duy trì trên
                20%.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Danh mục phổ biến:
                  </span>
                  <span className="text-sm font-medium">
                    {popularCategory
                      ? getCategoryLabel(popularCategory)
                      : "Chưa có"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-center"
                style={{ maxWidth: "calc(100vw - 100px)" }}
              >
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
