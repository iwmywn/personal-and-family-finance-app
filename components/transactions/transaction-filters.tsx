"use client"

import { useMemo, useState } from "react"
import { vi } from "date-fns/locale"
import { ChevronDownIcon, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories"
import { useCustomCategories, useTransactions } from "@/lib/swr"
import { getCategoryLabel } from "@/lib/utils/categories"
import { filterTransactions } from "@/lib/utils/filters"
import { formatDate } from "@/lib/utils/formatting"
import { getMonthsConfig, getUniqueYears } from "@/lib/utils/transactions"

export function TransactionFilters() {
  const { transactions } = useTransactions()
  const { customCategories } = useCustomCategories()
  const t = useTranslations("transactions")
  const tMonths = useTranslations("months")
  const [searchTerm, setSearchTerm] = useState<string>("")
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
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const [filterCategoryKey, setFilterCategoryKey] = useState<string>("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  const allMonths = getMonthsConfig(tMonths)
  const allYears = getUniqueYears(transactions!)

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedDate ||
    dateRange.from ||
    dateRange.to ||
    filterMonth !== "all" ||
    filterYear !== "all" ||
    filterType !== "all" ||
    filterCategoryKey !== "all"

  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedDate(undefined)
    setDateRange({ from: undefined, to: undefined })
    setFilterMonth("all")
    setFilterYear("all")
    setFilterType("all")
    setFilterCategoryKey("all")
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
      searchTerm,
      selectedDate,
      dateRange,
      filterMonth,
      filterYear,
      filterType,
      filterCategoryKey,
    })
  }, [
    transactions,
    searchTerm,
    selectedDate,
    dateRange,
    filterMonth,
    filterYear,
    filterType,
    filterCategoryKey,
  ])

  return (
    <>
      <Card ref={registerRef}>
        <CardContent>
          <div
            className={`grid md:grid-cols-[1fr_1fr] md:grid-rows-4 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-3 2xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] 2xl:grid-rows-2 ${
              hasActiveFilters &&
              "md:grid-rows-5 lg:grid-rows-4 2xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto]"
            } gap-4`}
          >
            <InputGroup
              className={`col-span-full ${searchTerm !== "" && "border-primary"}`}
            >
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t("searchPlaceholder")}
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

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between font-normal md:row-start-2 ${selectedDate && "border-primary!"}`}
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
                  className={`w-full justify-between font-normal md:row-start-2 ${dateRange.from && "border-primary!"}`}
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
                className={`w-full md:row-start-3 lg:row-start-2 ${filterMonth !== "all" && "border-primary"}`}
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
                className={`w-full md:row-start-3 2xl:row-start-2 ${filterYear !== "all" && "border-primary"}`}
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

            <Select
              value={filterType}
              onValueChange={(value: "all" | "income" | "expense") =>
                setFilterType(value)
              }
            >
              <SelectTrigger
                className={`w-full md:row-start-4 lg:row-start-3 2xl:row-start-2 ${filterType !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("transactionType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("allTransactionTypes")}
                  </SelectItem>
                  <SelectSeparator />
                  <SelectItem value="income">{t("income")}</SelectItem>
                  <SelectItem value="expense">{t("expense")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={filterCategoryKey}
              onValueChange={setFilterCategoryKey}
            >
              <SelectTrigger
                className={`w-full md:row-start-4 lg:row-start-3 2xl:row-start-2 ${filterCategoryKey !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  <SelectSeparator />
                  <SelectLabel>{t("income")}</SelectLabel>
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
                  <SelectLabel>{t("expense")}</SelectLabel>
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
                className="col-span-full 2xl:col-auto 2xl:row-start-2"
              >
                {t("reset")}
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
