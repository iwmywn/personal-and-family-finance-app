"use client"

import { useState } from "react"
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { ChevronDownIcon, MoreVertical, Receipt } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getCategoryDescription, getCategoryLabel } from "@/lib/categories"
import { Transaction } from "@/lib/definitions"
import { useCustomCategories } from "@/lib/swr"
import { formatCurrency, formatDate } from "@/lib/utils"

interface TransactionsTableProps {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  offsetHeight: number
}

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function TransactionsTable({
  transactions,
  filteredTransactions,
  offsetHeight,
}: TransactionsTableProps) {
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const [showTypeCol, setShowTypeCol] = useState<Checked>(true)
  const [showCategoryCol, setShowCategoryCol] = useState<Checked>(true)
  const [showAmountCol, setShowAmountCol] = useState<Checked>(true)
  const { categories: customCategories } = useCustomCategories()
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  return (
    <>
      <Card>
        <CardHeader ref={registerRef}>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            Xem chi tiết tất cả các giao dịch của bạn.
          </CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Tùy chỉnh cột
                  <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={true} disabled>
                  Ngày
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={true} disabled>
                  Mô tả
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showTypeCol}
                  onCheckedChange={setShowTypeCol}
                >
                  Loại
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showCategoryCol}
                  onCheckedChange={setShowCategoryCol}
                >
                  Danh mục
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showAmountCol}
                  onCheckedChange={setShowAmountCol}
                >
                  Số tiền
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <Empty
              className="border border-dashed"
              style={{
                minHeight: isLargeScreens
                  ? "300px"
                  : `calc(100vh - ${offsetHeight}px - ${calculatedHeight}px - 11.5rem)`,
              }}
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Receipt />
                </EmptyMedia>
                <EmptyTitle>Không tìm thấy giao dịch</EmptyTitle>
                <EmptyDescription>
                  {transactions.length === 0
                    ? "Bắt đầu thêm giao dịch của bạn."
                    : "Hãy thử từ khóa hoặc bộ lọc khác."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div
              className="overflow-auto rounded-md border [&>div]:overflow-x-visible!"
              style={{
                maxHeight: isLargeScreens
                  ? "300px"
                  : `calc(100vh - ${offsetHeight}px - ${calculatedHeight}px - 11.5rem)`,
              }}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow className="[&>th]:text-center">
                    <TableHead>Ngày</TableHead>
                    <TableHead>Mô tả</TableHead>
                    {showTypeCol && <TableHead>Loại</TableHead>}
                    {showCategoryCol && <TableHead>Danh mục</TableHead>}
                    {showAmountCol && <TableHead>Số tiền</TableHead>}
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
                      <TableCell className="max-w-72 min-w-48 wrap-anywhere whitespace-normal">
                        {transaction.description}
                      </TableCell>
                      {showTypeCol && (
                        <TableCell>
                          <Badge
                            className={
                              transaction.type === "income"
                                ? "badge-income"
                                : "badge-expense"
                            }
                          >
                            {transaction.type === "income"
                              ? "Thu nhập"
                              : "Chi tiêu"}
                          </Badge>
                        </TableCell>
                      )}
                      {showCategoryCol && (
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline">
                                  {getCategoryLabel(
                                    transaction.category,
                                    customCategories
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {getCategoryDescription(
                                  transaction.category,
                                  customCategories
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                      {showAmountCol && (
                        <TableCell className="max-w-72 min-w-48 wrap-anywhere whitespace-normal">
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
                      )}
                      <TableCell className="space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="dark:hover:bg-input/50"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreVertical />
                              <span className="sr-only">Mở menu</span>
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
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsDeleteOpen(true)
                              }}
                            >
                              Xóa
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
            key={selectedTransaction._id}
            transaction={selectedTransaction}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteTransactionDialog
            key={selectedTransaction._id}
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
