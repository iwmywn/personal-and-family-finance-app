"use client"

import { useState } from "react"
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
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BudgetsTable } from "@/components/budgets/budgets-table"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMonthsI18n } from "@/hooks/use-months-i18n"
import { EXPENSE_CATEGORIES_KEY } from "@/lib/categories"
import { filterBudgets } from "@/lib/filters"
import { useBudgets, useCustomCategories, useTransactions } from "@/lib/swr"
import { getUniqueYears } from "@/lib/utils"

export function BudgetsFilters() {
  const { budgets } = useBudgets()
  const { transactions } = useTransactions()
  const { customCategories } = useCustomCategories()
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
  const [filterCategoryKey, setFilterCategoryKey] = useState<string>("all")
  const [filterProgress, setFilterProgress] = useState<
    "all" | "gray" | "green" | "orange" | "red"
  >("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const tBudgetsFE = useTranslations("budgets.fe")
  const tCommonFE = useTranslations("common.fe")
  const { getCategoryLabel } = useCategoryI18n()
  const formatDate = useFormatDate()

  const allMonths = useMonthsI18n()
  const allYears = getUniqueYears(transactions!)

  const hasActiveFilters =
    selectedDate ||
    dateRange.from ||
    dateRange.to ||
    filterMonth !== "all" ||
    filterYear !== "all" ||
    filterCategoryKey !== "all" ||
    filterProgress !== "all"

  const handleResetFilters = () => {
    setSelectedDate(undefined)
    setDateRange({ from: undefined, to: undefined })
    setFilterMonth("all")
    setFilterYear("all")
    setFilterCategoryKey("all")
    setFilterProgress("all")
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

  const filteredBudgets = filterBudgets(
    budgets!,
    {
      selectedDate,
      dateRange,
      filterMonth,
      filterYear,
      filterCategoryKey,
      filterProgress,
    },
    transactions!
  )

  return (
    <>
      <Card ref={registerRef}>
        <CardContent>
          <div
            className={`grid md:grid-cols-[1fr_1fr] md:grid-rows-3 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-2 2xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] 2xl:grid-rows-1 ${
              hasActiveFilters &&
              "md:grid-rows-3 lg:grid-rows-3 2xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto]"
            } gap-4`}
          >
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between font-normal md:row-start-1 ${selectedDate && "border-primary!"}`}
                >
                  {selectedDate
                    ? formatDate(selectedDate)
                    : tCommonFE("selectDate")}
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
                  className={`w-full justify-between font-normal md:row-start-1 ${dateRange.from && "border-primary!"}`}
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
                    tCommonFE("selectDateRange")
                  )}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col p-4 sm:flex-row">
                  <div>
                    <div className="mb-2 text-center text-sm font-medium">
                      {tCommonFE("from")}
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
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-center text-sm font-medium">
                      {tCommonFE("to")}
                    </div>
                    <Calendar
                      autoFocus
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
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={filterMonth} onValueChange={handleMonthChange}>
              <SelectTrigger
                className={`w-full md:row-start-2 lg:row-start-1 ${filterMonth !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={tCommonFE("month")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{tCommonFE("allMonths")}</SelectItem>
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
                className={`w-full md:row-start-2 2xl:row-start-1 ${filterYear !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={tCommonFE("year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{tCommonFE("allYears")}</SelectItem>
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
              value={filterCategoryKey}
              onValueChange={setFilterCategoryKey}
            >
              <SelectTrigger
                className={`w-full md:row-start-3 lg:row-start-2 2xl:row-start-1 ${filterCategoryKey !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={tCommonFE("category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {tBudgetsFE("allCategories")}
                  </SelectItem>
                  <SelectSeparator />
                  <SelectLabel>{tCommonFE("expense")}</SelectLabel>
                  {EXPENSE_CATEGORIES_KEY.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                  {customCategories!
                    .filter((c) => c.type === "expense")
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

            <Select
              value={filterProgress}
              onValueChange={(
                value: "all" | "gray" | "green" | "orange" | "red"
              ) => setFilterProgress(value)}
            >
              <SelectTrigger
                className={`w-full md:row-start-3 lg:row-start-2 2xl:row-start-1 ${filterProgress !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={tBudgetsFE("progress")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {tBudgetsFE("allProgress")}
                  </SelectItem>
                  <SelectSeparator />
                  <SelectItem value="gray">
                    {tBudgetsFE("progressGray")}
                  </SelectItem>
                  <SelectItem value="green">
                    {tBudgetsFE("progressGreen")}
                  </SelectItem>
                  <SelectItem value="orange">
                    {tBudgetsFE("progressOrange")}
                  </SelectItem>
                  <SelectItem value="red">
                    {tBudgetsFE("progressRed")}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="col-span-full 2xl:col-auto 2xl:row-start-1"
              >
                {tCommonFE("reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <BudgetsTable
        filteredBudgets={filteredBudgets}
        offsetHeight={calculatedHeight}
      />
    </>
  )
}
