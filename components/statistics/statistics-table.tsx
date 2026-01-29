"use client"

import { WalletIcon } from "lucide-react"
import { useExtracted } from "next-intl"

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
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { type Transaction } from "@/lib/definitions"
import { calculateCategoriesStats } from "@/lib/statistics"

interface TransactionBreakdownTableProps {
  filteredTransactions: Transaction[]
}

export function StatisticsTable({
  filteredTransactions,
}: TransactionBreakdownTableProps) {
  const { transactions } = useAppData()
  const t = useExtracted()
  const { getCategoryLabel, getCategoryDescription } = useCategory()
  const formatCurrency = useFormatCurrency()

  const categoryStats = calculateCategoriesStats(filteredTransactions)

  return (
    <Card className="flex-1 overflow-auto">
      <CardContent className="h-full">
        {filteredTransactions.length === 0 ? (
          <Empty className="h-full border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>{t("No transactions found")}</EmptyTitle>
              <EmptyDescription>
                {transactions.length === 0
                  ? t("You haven't created any transactions yet.")
                  : t("No transactions found matching your filters.")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="table-wrapper md:max-h-90 lg:max-h-none">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-1">
                <TableRow className="[&>th]:text-center">
                  <TableHead>{t("Category")}</TableHead>
                  <TableHead>{t("Type")}</TableHead>
                  <TableHead>{t("Transaction Count")}</TableHead>
                  <TableHead>{t("Total Amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryStats.map((stat) => (
                  <TableRow
                    key={stat.categoryKey}
                    className="[&>td]:text-center"
                  >
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline">
                            {getCategoryLabel(stat.categoryKey)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {getCategoryDescription(stat.categoryKey)}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          stat.type === "income" ? "badge-green" : "badge-red"
                        }
                      >
                        {stat.type === "income" ? t("Income") : t("Expense")}
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
