"use client"

import { ReceiptIcon } from "lucide-react"
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
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { type Transaction } from "@/lib/definitions"
import { calculateCategoryStats } from "@/lib/statistics"
import { formatCurrency } from "@/lib/utils"

interface TransactionBreakdownTableProps {
  filteredTransactions: Transaction[]
}

export function TransactionBreakdownTable({
  filteredTransactions,
}: TransactionBreakdownTableProps) {
  const { transactions, customCategories } = useAppData()
  const t = useTranslations()
  const { getCategoryLabel, getCategoryDescription } = useCategoryI18n()

  const categoryStats = calculateCategoryStats(filteredTransactions)

  return (
    <Card>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <Empty className="border" style={{ minHeight: "300px" }}>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptIcon />
              </EmptyMedia>
              <EmptyTitle>{t("common.fe.noTransactionsFound")}</EmptyTitle>
              <EmptyDescription>
                {transactions!.length === 0
                  ? t("common.fe.startAddingTransactions")
                  : t("common.fe.noTransactionsFiltered")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted sticky top-0">
                <TableRow className="[&>th]:text-center">
                  <TableHead>{t("common.fe.category")}</TableHead>
                  <TableHead>{t("common.fe.type")}</TableHead>
                  <TableHead>{t("statistics.fe.transactionCount")}</TableHead>
                  <TableHead>{t("statistics.fe.totalAmount")}</TableHead>
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
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          stat.type === "income" ? "badge-green" : "badge-red"
                        }
                      >
                        {stat.type === "income"
                          ? t("common.fe.income")
                          : t("common.fe.expense")}
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
