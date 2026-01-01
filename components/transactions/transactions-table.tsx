"use client"

import { useState } from "react"
import { MoreVerticalIcon, WalletIcon } from "lucide-react"
import { useExtracted } from "next-intl"

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
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { useFormatDate } from "@/hooks/use-format-date"
import { type Transaction } from "@/lib/definitions"

interface TransactionsTableProps {
  filteredTransactions: Transaction[]
}

export function TransactionsTable({
  filteredTransactions,
}: TransactionsTableProps) {
  const { transactions } = useAppData()
  const t = useExtracted()
  const { getCategoryLabel, getCategoryDescription } = useCategory()
  const formatDate = useFormatDate()
  const formatCurrency = useFormatCurrency()
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  return (
    <>
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
                    ? t("Start adding your transactions.")
                    : t("No transactions found matching your filters.")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="table-wrapper">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-1">
                  <TableRow className="[&>th]:text-center">
                    <TableHead>{t("Date")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead>{t("Type")}</TableHead>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead>{t("Amount")}</TableHead>
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
                              ? "badge-green"
                              : "badge-red"
                          }
                        >
                          {transaction.type === "income"
                            ? t("Income")
                            : t("Expense")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              {getCategoryLabel(transaction.categoryKey)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(transaction.categoryKey)}
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
                              <MoreVerticalIcon />
                              <span className="sr-only">{t("Open menu")}</span>
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
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsDeleteOpen(true)
                              }}
                            >
                              {t("Delete")}
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
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
          />
        </>
      )}
    </>
  )
}
