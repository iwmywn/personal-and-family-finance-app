"use client"

import { useMemo } from "react"
import { Receipt } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Transaction, TransactionCategoryKey } from "@/lib/definitions"
import { useCustomCategories } from "@/lib/swr"
import {
  formatCurrency,
  getCategoryDescription,
  getCategoryLabel,
} from "@/lib/utils"

interface TransactionBreakdownTableProps {
  filteredTransactions: Transaction[]
}

export function TransactionBreakdownTable({
  filteredTransactions,
}: TransactionBreakdownTableProps) {
  const { customCategories } = useCustomCategories()
  const categoryStats = useMemo(() => {
    const stats = new Map<
      string,
      { count: number; total: number; type: "income" | "expense" }
    >()

    filteredTransactions.forEach((transaction) => {
      const categoryKey = transaction.categoryKey
      const current = stats.get(categoryKey) || {
        count: 0,
        total: 0,
        type: transaction.type,
      }
      stats.set(categoryKey, {
        count: current.count + 1,
        total: current.total + transaction.amount,
        type: transaction.type,
      })
    })

    return Array.from(stats.entries())
      .map(([categoryKey, data]) => ({
        categoryKey,
        categoryLabel: getCategoryLabel(
          categoryKey as TransactionCategoryKey,
          customCategories
        ),
        count: data.count,
        total: data.total,
        type: data.type,
      }))
      .sort((a, b) => b.total - a.total)
  }, [filteredTransactions, customCategories])

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>Thống kê theo danh mục</CardTitle>
        <CardDescription>
          Phân tích chi tiết theo từng danh mục.
        </CardDescription>
      </CardHeader> */}
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <Empty className="border" style={{ minHeight: "300px" }}>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt />
              </EmptyMedia>
              <EmptyTitle>Không có giao dịch</EmptyTitle>
              <EmptyDescription>
                Không có giao dịch nào để phân tích.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted sticky top-0">
                <TableRow className="[&>th]:text-center">
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số giao dịch</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryStats.map((stat) => (
                  <TableRow
                    key={stat.categoryKey}
                    className="[&>td]:text-center"
                  >
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              {getCategoryLabel(
                                stat.categoryKey,
                                customCategories
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(
                              stat.categoryKey,
                              customCategories
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          stat.type === "income"
                            ? "badge-income"
                            : "badge-expense"
                        }
                      >
                        {stat.type === "income" ? "Thu nhập" : "Chi tiêu"}
                      </Badge>
                    </TableCell>
                    <TableCell>{stat.count}</TableCell>
                    <TableCell className="font-medium">
                      <span
                        className={
                          stat.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {stat.type === "income" ? "+" : "-"}
                        {formatCurrency(stat.total)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
