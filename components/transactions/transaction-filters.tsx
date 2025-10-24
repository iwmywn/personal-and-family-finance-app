"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import {
  EXPENSE_CATEGORIES,
  getCategoryLabel,
  INCOME_CATEGORIES,
} from "@/lib/categories"
import { useCustomCategories, useTransactions } from "@/lib/swr"

export function TransactionFilters() {
  const { transactions } = useTransactions()
  const { customCategories } = useCustomCategories()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const [filterCategoryKey, setFilterCategoryKey] = useState<string>("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  const filteredTransactions = useMemo(() => {
    return transactions!.filter((transaction) => {
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

      const matchesType =
        filterType === "all" || transaction.type === filterType

      const matchesCategory =
        filterCategoryKey === "all" ||
        transaction.categoryKey === filterCategoryKey

      return (
        matchesSearch &&
        matchesMonth &&
        matchesYear &&
        matchesType &&
        matchesCategory
      )
    })
  }, [
    transactions,
    searchTerm,
    filterMonth,
    filterYear,
    filterType,
    filterCategoryKey,
  ])

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
    new Set(transactions!.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a)

  const handleResetFilters = () => {
    setSearchTerm("")
    setFilterMonth("all")
    setFilterYear("all")
    setFilterType("all")
    setFilterCategoryKey("all")
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    filterMonth !== "all" ||
    filterYear !== "all" ||
    filterType !== "all" ||
    filterCategoryKey !== "all"

  return (
    <>
      <Card ref={registerRef}>
        <CardContent>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              hasActiveFilters
                ? "lg:grid-cols-[1fr_auto_auto_auto_auto_auto]"
                : "lg:grid-cols-[1fr_auto_auto_auto_auto]"
            } gap-4`}
          >
            <InputGroup
              className={`sm:col-span-2 lg:col-span-1 ${searchTerm !== "" && "border-primary"}`}
            >
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
              <SelectTrigger
                className={`w-full lg:w-fit ${filterMonth !== "all" && "border-primary"}`}
              >
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
              <SelectTrigger
                className={`w-full lg:w-fit ${filterYear !== "all" && "border-primary"}`}
              >
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
              <SelectTrigger
                className={`w-full lg:w-fit ${filterType !== "all" && "border-primary"}`}
              >
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
            <Select
              value={filterCategoryKey}
              onValueChange={setFilterCategoryKey}
            >
              <SelectTrigger
                className={`w-full lg:w-fit ${filterCategoryKey !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectSeparator />
                  <SelectLabel>Thu nhập</SelectLabel>
                  {INCOME_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                  {customCategories
                    ?.filter((c) => c.type === "income")
                    .map((category) => (
                      <SelectItem
                        key={category._id}
                        value={category.categoryKey}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  <SelectLabel>Chi tiêu</SelectLabel>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                  {customCategories
                    ?.filter((c) => c.type === "expense")
                    .map((category) => (
                      <SelectItem
                        key={category._id}
                        value={category.categoryKey}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="sm:col-span-2 lg:col-span-1 lg:w-fit"
              >
                Đặt lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionsTable
        filteredTransactions={filteredTransactions}
        offsetHeight={calculatedHeight}
      />
    </>
  )
}
