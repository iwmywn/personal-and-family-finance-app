"use client"

import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"
import { useExtracted } from "next-intl"

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
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMonths } from "@/hooks/use-months"
import { EXPENSE_CATEGORIES_KEY } from "@/lib/categories"
import { filterBudgets } from "@/lib/filters"
import { getUniqueYears } from "@/lib/utils"

export function BudgetsFilters() {
  const { budgets, transactions, customCategories } = useAppData()
  const [isDateRangeOpen, setIsDateRangeOpen] = useState<boolean>(false)
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
    "all" | "gray" | "green" | "yellow" | "red"
  >("all")
  const [filterStatus, setFilterStatus] = useState<
    "all" | "expired" | "active" | "upcoming"
  >("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const t = useExtracted()
  const { getCategoryLabel } = useCategory()
  const formatDate = useFormatDate()

  const allMonths = useMonths()
  const allYears = getUniqueYears(transactions)

  const hasActiveFilters =
    dateRange.from ||
    dateRange.to ||
    filterMonth !== "all" ||
    filterYear !== "all" ||
    filterCategoryKey !== "all" ||
    filterProgress !== "all" ||
    filterStatus !== "all"

  const handleResetFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setFilterMonth("all")
    setFilterYear("all")
    setFilterCategoryKey("all")
    setFilterProgress("all")
    setFilterStatus("all")
  }

  const handleDateRangeChange = (range: {
    from: Date | undefined
    to: Date | undefined
  }) => {
    setDateRange(range)
    setFilterMonth("all")
    setFilterYear("all")
    setIsDateRangeOpen(false)
  }

  const handleMonthChange = (month: string) => {
    setFilterMonth(month)
    if (month !== "all") {
      setDateRange({ from: undefined, to: undefined })
    }
  }

  const handleYearChange = (year: string) => {
    setFilterYear(year)
    if (year !== "all") {
      setDateRange({ from: undefined, to: undefined })
    }
  }

  const filteredBudgets = filterBudgets(
    budgets,
    {
      dateRange,
      filterMonth,
      filterYear,
      filterCategoryKey,
      filterProgress,
      filterStatus,
    },
    transactions
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
                    t("Select Date Range")
                  )}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col p-4 sm:flex-row">
                  <div>
                    <div className="mb-2 text-center text-sm font-medium">
                      {t("From")}
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
                      {t("To")}
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
                className={`w-full md:row-start-1 ${filterMonth !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("Month")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("All Months")}</SelectItem>
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
                className={`w-full md:row-start-2 lg:row-start-1 ${filterYear !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("Year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("All Years")}</SelectItem>
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
                className={`w-full md:row-start-2 2xl:row-start-1 ${filterCategoryKey !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("All Categories")}</SelectItem>
                  <SelectSeparator />
                  <SelectLabel>{t("Expense")}</SelectLabel>
                  {EXPENSE_CATEGORIES_KEY.map((categoryKey) => (
                    <SelectItem key={categoryKey} value={categoryKey}>
                      {getCategoryLabel(categoryKey)}
                    </SelectItem>
                  ))}
                  {customCategories
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
                value: "all" | "gray" | "green" | "yellow" | "red"
              ) => setFilterProgress(value)}
            >
              <SelectTrigger
                className={`w-full md:row-start-3 lg:row-start-2 2xl:row-start-1 ${filterProgress !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("Progress")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("All Progress")}</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="gray">{t("No Transactions")}</SelectItem>
                  <SelectItem value="green">{t("Good (< 75%)")}</SelectItem>
                  <SelectItem value="yellow">
                    {t("Warning (75-100%)")}
                  </SelectItem>
                  <SelectItem value="red">{t("Exceeded (≥ 100%)")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(
                value: "all" | "expired" | "active" | "upcoming"
              ) => setFilterStatus(value)}
            >
              <SelectTrigger
                className={`w-full md:row-start-3 lg:row-start-2 2xl:row-start-1 ${filterStatus !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("All Statuses")}</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="expired">{t("Expired")}</SelectItem>
                  <SelectItem value="active">{t("Active")}</SelectItem>
                  <SelectItem value="upcoming">{t("Upcoming")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="col-span-full 2xl:col-auto 2xl:row-start-1"
              >
                {t("Reset")}
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
