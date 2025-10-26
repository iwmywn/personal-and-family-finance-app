"use client"

import { useMemo, useState } from "react"
import { vi } from "date-fns/locale"
import { ChevronDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { filterTransactions } from "@/lib/utils/filters"
import { formatDate } from "@/lib/utils/formatting"
import { getMonthsConfig, getUniqueYears } from "@/lib/utils/transactions"

export function StatisticsFilters() {
  const { transactions } = useTransactions()
  const t = useTranslations("statistics")
  const tMonths = useTranslations("months")
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

  const allMonths = getMonthsConfig(tMonths)
  const allYears = getUniqueYears(transactions!)

  const hasActiveFilters =
    selectedDate ||
    dateRange.from ||
    dateRange.to ||
    filterMonth !== "all" ||
    filterYear !== "all"

  const handleResetFilters = () => {
    setSelectedDate(undefined)
    setDateRange({ from: undefined, to: undefined })
    setFilterMonth("all")
    setFilterYear("all")
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    setDateRange({ from: undefined, to: undefined })
    setFilterMonth("all")
    setFilterYear("all")
    setIsDatePickerOpen(false)
  }

  const handleDateRangeChange = (range: {
    from: Date | undefined
    to: Date | undefined
  }) => {
    setDateRange(range)
    setSelectedDate(undefined)
    setFilterMonth("all")
    setFilterYear("all")
    setIsDateRangeOpen(false)
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
    return filterTransactions(transactions!, {
      selectedDate,
      dateRange,
      filterMonth,
      filterYear,
    })
  }, [transactions, selectedDate, dateRange, filterMonth, filterYear])

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
                  className={`w-full justify-between font-normal ${selectedDate && "border-primary!"}`}
                >
                  {selectedDate ? formatDate(selectedDate) : t("selectDate")}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  autoFocus
                  mode="single"
                  selected={selectedDate}
                  captionLayout="dropdown"
                  onSelect={(date) => handleDateChange(date)}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>

            <Popover
              open={isDateRangeOpen}
              onOpenChange={(open) => {
                if (!open && dateRange.from && !dateRange.to) {
                  return
                }
                setIsDateRangeOpen(open)
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between font-normal ${dateRange.from && "border-primary!"}`}
                >
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from)} -{" "}
                        {formatDate(dateRange.to)}
                      </>
                    ) : (
                      formatDate(dateRange.from)
                    )
                  ) : (
                    t("selectDateRange")
                  )}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col p-4 sm:flex-row">
                  <div>
                    <div className="mb-2 text-center text-sm font-medium">
                      {t("from")}
                    </div>
                    <Calendar
                      autoFocus
                      mode="single"
                      selected={dateRange.from}
                      defaultMonth={dateRange.from || new Date()}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDateRange((prev) => ({
                          from: date,
                          to:
                            prev.to && date && date > prev.to
                              ? undefined
                              : prev.to,
                        }))
                      }}
                      locale={vi}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-center text-sm font-medium">
                      {t("to")}
                    </div>
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      defaultMonth={dateRange.to || new Date()}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date && dateRange.from && date >= dateRange.from) {
                          handleDateRangeChange({
                            from: dateRange.from,
                            to: date,
                          })
                        }
                      }}
                      locale={vi}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={filterMonth} onValueChange={handleMonthChange}>
              <SelectTrigger
                className={`w-full ${filterMonth !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("month")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("allMonths")}</SelectItem>
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
                <SelectValue placeholder={t("year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("allYears")}</SelectItem>
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
                {t("reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <StatisticsSummary filteredTransactions={filteredTransactions} />

      <TransactionBreakdownTable filteredTransactions={filteredTransactions} />
    </div>
  )
}
