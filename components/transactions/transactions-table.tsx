"use client"

import { useState } from "react"
import { MoreVertical, Receipt } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMediaQuery } from "@/hooks/use-media-query"
import { type Transaction } from "@/lib/definitions"
import { useCustomCategories, useTransactions } from "@/lib/swr"
import { formatCurrency } from "@/lib/utils"

interface TransactionsTableProps {
  filteredTransactions: Transaction[]
  offsetHeight: number
}

export function TransactionsTable({
  filteredTransactions,
  offsetHeight,
}: TransactionsTableProps) {
  const { transactions } = useTransactions()
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")
  const { customCategories } = useCustomCategories()
  const tTransactionsFE = useTranslations("transactions.fe")
  const tCommonFE = useTranslations("common.fe")
  const { getCategoryLabel, getCategoryDescription } = useCategoryI18n()
  const formatDate = useFormatDate()
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  return (
    <>
      <Card>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <Empty
              className="border"
              style={{
                minHeight: isLargeScreens
                  ? "300px"
                  : `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
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
            <div
              className="overflow-auto rounded-md border [&>div]:overflow-x-visible!"
              style={{
                maxHeight: isLargeScreens
                  ? "300px"
                  : `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow className="[&>th]:text-center">
                    <TableHead>{tTransactionsFE("date")}</TableHead>
                    <TableHead>{tCommonFE("description")}</TableHead>
                    <TableHead>{tCommonFE("type")}</TableHead>
                    <TableHead>{tCommonFE("category")}</TableHead>
                    <TableHead>{tTransactionsFE("amount")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction._id.toString()}
                      className="[&>td]:text-center"
                    >
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="max-w-md min-w-52 wrap-anywhere whitespace-normal">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transaction.type === "income"
                              ? "badge-income"
                              : "badge-expense"
                          }
                        >
                          {transaction.type === "income"
                            ? tCommonFE("income")
                            : tCommonFE("expense")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              {getCategoryLabel(
                                transaction.categoryKey,
                                customCategories
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(
                              transaction.categoryKey,
                              customCategories
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="min-w-38 wrap-anywhere whitespace-normal">
                        <span
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="dark:hover:bg-input/50"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreVertical />
                              <span className="sr-only">
                                {tTransactionsFE("openMenu")}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsEditOpen(true)
                              }}
                            >
                              {tCommonFE("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsDeleteOpen(true)
                              }}
                            >
                              {tCommonFE("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <>
          <TransactionDialog
            key={selectedTransaction._id + "TransactionDialog"}
            transaction={selectedTransaction}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteTransactionDialog
            key={selectedTransaction._id + "DeleteTransactionDialog"}
            transactionId={selectedTransaction._id}
            transactionDescription={selectedTransaction.description}
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
          />
        </>
      )}
    </>
  )
}
