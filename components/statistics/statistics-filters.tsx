"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatisticsSummary } from "@/components/statistics/statistics-summary"
import { TransactionBreakdownTable } from "@/components/statistics/transaction-breakdown-table"
import { useTransactions } from "@/lib/swr"
import { cn } from "@/lib/utils"

export function StatisticsFilters() {
  const { transactions } = useTransactions()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")

  const handleResetFilters = () => {
    setSelectedDate(undefined)
    setDateRange({ from: undefined, to: undefined })
    setFilterMonth("all")
    setFilterYear("all")
  }

  const hasActiveFilters =
    selectedDate ||
    dateRange.from ||
    dateRange.to ||
    filterMonth !== "all" ||
    filterYear !== "all"

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

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setDateRange({ from: undefined, to: undefined })
      setFilterMonth("all")
      setFilterYear("all")
    }
  }

  const handleDateRangeChange = (range: {
    from: Date | undefined
    to: Date | undefined
  }) => {
    setDateRange(range)
    if (range.from || range.to) {
      setSelectedDate(undefined)
      setFilterMonth("all")
      setFilterYear("all")
    }
  }

  const handleMonthChange = (month: string) => {
    setFilterMonth(month)
    if (month !== "all") {
      setSelectedDate(undefined)
      setDateRange({ from: undefined, to: undefined })
    }
  }

  const handleYearChange = (year: string) => {
    setFilterYear(year)
    if (year !== "all") {
      setSelectedDate(undefined)
      setDateRange({ from: undefined, to: undefined })
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions!.filter((transaction) => {
      const transactionDate = new Date(transaction.date)

      const matchesSelectedDate = selectedDate
        ? transactionDate.getDate() === selectedDate.getDate() &&
          transactionDate.getMonth() === selectedDate.getMonth() &&
          transactionDate.getFullYear() === selectedDate.getFullYear()
        : true

      const matchesDateRange =
        (!dateRange.from || transactionDate >= dateRange.from) &&
        (!dateRange.to || transactionDate <= dateRange.to)

      const matchesMonth =
        filterMonth === "all" ||
        transactionDate.getMonth() + 1 === parseInt(filterMonth)

      const matchesYear =
        filterYear === "all" ||
        transactionDate.getFullYear() === parseInt(filterYear)

      return (
        matchesSelectedDate && matchesDateRange && matchesMonth && matchesYear
      )
    })
  }, [transactions, selectedDate, dateRange, filterMonth, filterYear])

  const summaryStats = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(
      (t) => t.type === "income"
    )
    const expenseTransactions = filteredTransactions.filter(
      (t) => t.type === "expense"
    )

    const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const expenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const netWorth = income - expenses
    const transactionCount = filteredTransactions.length
    const incomeCount = incomeTransactions.length
    const expenseCount = expenseTransactions.length

    return {
      income,
      expenses,
      netWorth,
      transactionCount,
      incomeCount,
      expenseCount,
    }
  }, [filteredTransactions])

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              hasActiveFilters
                ? "lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                : "lg:grid-cols-[1fr_1fr_1fr_1fr]"
            } gap-4`}
          >
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  autoFocus
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    handleDateChange(date)
                    if (date) {
                      setIsDatePickerOpen(false)
                    }
                  }}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>

            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                    )
                  ) : (
                    "Chọn khoảng thời gian"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  autoFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    handleDateRangeChange({
                      from: range?.from,
                      to: range?.to,
                    })
                    if (range?.from && range?.to) {
                      setIsDateRangeOpen(false)
                    }
                  }}
                  numberOfMonths={2}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>

            <Select value={filterMonth} onValueChange={handleMonthChange}>
              <SelectTrigger
                className={`w-full ${filterMonth !== "all" && "border-primary"}`}
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

            <Select value={filterYear} onValueChange={handleYearChange}>
              <SelectTrigger
                className={`w-full ${filterYear !== "all" && "border-primary"}`}
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

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="sm:col-span-2 lg:col-span-1"
              >
                Đặt lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <StatisticsSummary stats={summaryStats} />

      <TransactionBreakdownTable filteredTransactions={filteredTransactions} />
    </div>
  )
}
