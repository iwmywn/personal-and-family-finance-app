"use client"

import { useMemo } from "react"
import { Receipt } from "lucide-react"
import { useTranslations } from "next-intl"

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
import { getCategoryDescription, getCategoryLabel } from "@/lib/categories"
import { Transaction } from "@/lib/definitions"
import { calculateCategoryStats } from "@/lib/statistics"
import { useCustomCategories, useTransactions } from "@/lib/swr"
import { formatCurrency } from "@/lib/utils"

interface TransactionBreakdownTableProps {
  filteredTransactions: Transaction[]
}

export function TransactionBreakdownTable({
  filteredTransactions,
}: TransactionBreakdownTableProps) {
  const { transactions } = useTransactions()
  const { customCategories } = useCustomCategories()
  const tStatisticsFE = useTranslations("statistics.fe")
  const tCommonFE = useTranslations("common.fe")

  const categoryStats = useMemo(() => {
    return calculateCategoryStats(filteredTransactions)
  }, [filteredTransactions])

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
              <EmptyTitle>{tCommonFE("noTransactionsFound")}</EmptyTitle>
              <EmptyDescription>
                {transactions!.length === 0
                  ? tCommonFE("startAddingTransactions")
                  : tCommonFE("noTransactionsFiltered")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted sticky top-0">
                <TableRow className="[&>th]:text-center">
                  <TableHead>{tCommonFE("category")}</TableHead>
                  <TableHead>{tCommonFE("type")}</TableHead>
                  <TableHead>{tStatisticsFE("transactionCount")}</TableHead>
                  <TableHead>{tStatisticsFE("totalAmount")}</TableHead>
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
                        {stat.type === "income"
                          ? tCommonFE("income")
                          : tCommonFE("expense")}
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
