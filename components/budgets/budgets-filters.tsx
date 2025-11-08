"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"

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
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BudgetsTable } from "@/components/budgets/budgets-table"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { filterBudgets } from "@/lib/filters"
import { useBudgets } from "@/lib/swr"

export function BudgetsFilters() {
  const { budgets } = useBudgets()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed"
  >("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const tBudgetsFE = useTranslations("budgets.fe")
  const tCommonFE = useTranslations("common.fe")
  const { getCategoryLabel } = useCategoryI18n()

  const filteredBudgets = filterBudgets(
    budgets!,
    { searchTerm, filterStatus },
    getCategoryLabel
  )

  const handleResetFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
  }

  const hasActiveFilters = searchTerm !== "" || filterStatus !== "all"

  return (
    <>
      <Card ref={registerRef}>
        <CardContent>
          <div
            className={`grid grid-cols-1 ${
              hasActiveFilters
                ? "md:grid-cols-[1fr_auto_auto]"
                : "md:grid-cols-[1fr_auto]"
            } gap-4`}
          >
            <InputGroup className={`${searchTerm !== "" && "border-primary"}`}>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={tBudgetsFE("searchPlaceholder")}
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
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | "active" | "completed") =>
                setFilterStatus(value)
              }
            >
              <SelectTrigger
                className={`w-full md:w-fit ${filterStatus !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={tBudgetsFE("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tBudgetsFE("allStatuses")}</SelectItem>
                <SelectSeparator />
                <SelectItem value="active">{tBudgetsFE("active")}</SelectItem>
                <SelectItem value="completed">
                  {tBudgetsFE("completed")}
                </SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="default"
                onClick={handleResetFilters}
                className="w-full md:w-fit"
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
