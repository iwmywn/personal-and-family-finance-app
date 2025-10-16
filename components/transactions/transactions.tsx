"use client"

import { useState } from "react"
import { Receipt, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  EXPENSE_CATEGORIES,
  getCategoryLabel,
  INCOME_CATEGORIES,
} from "@/lib/categories"
import { useTransactions, useUser } from "@/lib/swr"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function Transactions() {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  if (isUserLoading || isTransactionsLoading) {
    return (
      <div className="center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) {
    return <div className="center">Không thể tải thông tin người dùng!</div>
  }

  if (!transactions) {
    return <div className="center">Không thể tải giao dịch!</div>
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const transactionDate = new Date(transaction.date)
    const matchesMonth =
      filterMonth === "all" ||
      transactionDate.getMonth() + 1 === parseInt(filterMonth)
    const matchesYear =
      filterYear === "all" ||
      transactionDate.getFullYear() === parseInt(filterYear)

    const matchesType = filterType === "all" || transaction.type === filterType

    const matchesCategory =
      filterCategory === "all" || transaction.category === filterCategory

    return (
      matchesSearch &&
      matchesMonth &&
      matchesYear &&
      matchesType &&
      matchesCategory
    )
  })

  const allMonths = [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ]

  const allYears = Array.from(
    new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a)

  return (
    <div className="space-y-4">
      <div ref={registerRef} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Giao dịch</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý tất cả giao dịch thu chi của bạn.
          </p>
        </div>
        <TransactionDialog />
      </div>

      <Card ref={registerRef}>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Tìm kiếm giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    className="rounded-full"
                    size="icon-xs"
                    onClick={() => setSearchTerm("")}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full md:w-fit">
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả tháng</SelectItem>
                  <SelectSeparator />
                  {allMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full md:w-fit">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  <SelectSeparator />
                  {allYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={filterType}
              onValueChange={(value: "all" | "income" | "expense") =>
                setFilterType(value)
              }
            >
              <SelectTrigger className="w-full md:w-fit">
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả loại giao dịch</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="income">Thu nhập</SelectItem>
                  <SelectItem value="expense">Chi tiêu</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-fit">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectSeparator />
                  <SelectLabel>Chi tiêu</SelectLabel>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectLabel>Thu nhập</SelectLabel>
                  {INCOME_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader ref={registerRef}>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-lg">Lịch sử giao dịch</CardTitle>
              <CardDescription>
                Xem chi tiết tất cả các giao dịch của bạn.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <Empty
              className="border border-dashed"
              style={{
                minHeight: isMobile
                  ? "300px"
                  : `calc(100vh - ${calculatedHeight}px - 11.5rem)`,
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
                    : "Thử tìm kiếm với từ khóa khác."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div
              className="overflow-auto [&>div]:overflow-x-visible!"
              style={{
                maxHeight: isMobile
                  ? "300px"
                  : `calc(100vh - ${calculatedHeight}px - 11.5rem)`,
              }}
            >
              <Table>
                <TableHeader>
                  <TableRow className="[&_th]:bg-card [&_th]:sticky [&_th]:top-0">
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-center">Mô tả</TableHead>
                    <TableHead className="text-center">Danh mục</TableHead>
                    <TableHead className="text-center">Loại</TableHead>
                    <TableHead className="text-center">Số tiền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id.toString()}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="text-center wrap-anywhere min-w-48 max-w-72 whitespace-normal">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {getCategoryLabel(transaction.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {transaction.type === "income"
                            ? "Thu nhập"
                            : "Chi tiêu"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <TransactionDialog transaction={transaction} />
                          <DeleteTransactionDialog
                            transactionId={transaction._id}
                            transactionDescription={transaction.description}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
