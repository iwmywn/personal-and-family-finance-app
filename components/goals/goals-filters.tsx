"use client"

import { useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GoalsTable } from "@/components/goals/goals-table"
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { INCOME_CATEGORIES_KEY } from "@/lib/categories"
import { filterGoals } from "@/lib/filters"

export function GoalsFilters() {
  const { goals, customCategories } = useAppData()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "active" | "overdue"
  >("all")
  const [filterProgress, setFilterProgress] = useState<
    "all" | "gray" | "green" | "yellow" | "red"
  >("all")
  const [filterCategoryKey, setFilterCategoryKey] = useState<string>("all")
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const t = useTranslations()
  const { getCategoryLabel } = useCategoryI18n()

  const hasActiveFilters =
    searchTerm !== "" ||
    filterStatus !== "all" ||
    filterProgress !== "all" ||
    filterCategoryKey !== "all"

  const handleResetFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterProgress("all")
    setFilterCategoryKey("all")
  }

  const filteredGoals = filterGoals(goals, {
    searchTerm,
    filterStatus,
    filterProgress,
    filterCategoryKey,
  })

  return (
    <>
      <Card ref={registerRef}>
        <CardContent>
          <div
            className={`grid md:grid-cols-[1fr_1fr] md:grid-rows-2 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-2 2xl:grid-cols-[1fr_1fr_1fr_1fr] 2xl:grid-rows-1 ${
              hasActiveFilters &&
              "md:grid-rows-2 lg:grid-rows-2 2xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            } gap-4`}
          >
            <InputGroup className="md:row-start-1">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t("goals.fe.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <InputGroupButton
                  onClick={() => setSearchTerm("")}
                  type="button"
                >
                  <XIcon />
                </InputGroupButton>
              )}
            </InputGroup>

            <Select
              value={filterStatus}
              onValueChange={(
                value: "all" | "completed" | "active" | "overdue"
              ) => setFilterStatus(value)}
            >
              <SelectTrigger
                className={`w-full md:row-start-1 ${filterStatus !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("goals.fe.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("goals.fe.allStatuses")}
                  </SelectItem>
                  <SelectSeparator />
                  <SelectItem value="completed">
                    {t("goals.fe.completed")}
                  </SelectItem>
                  <SelectItem value="active">{t("goals.fe.active")}</SelectItem>
                  <SelectItem value="overdue">
                    {t("goals.fe.overdue")}
                  </SelectItem>
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
                className={`w-full md:row-start-2 lg:row-start-1 2xl:row-start-1 ${filterProgress !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={t("goals.fe.progress")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("goals.fe.allProgress")}
                  </SelectItem>
                  <SelectSeparator />
                  <SelectItem value="gray">
                    {t("goals.fe.progressGray")}
                  </SelectItem>
                  <SelectItem value="green">
                    {t("goals.fe.progressGreen")}
                  </SelectItem>
                  <SelectItem value="yellow">
                    {t("goals.fe.progressYellow")}
                  </SelectItem>
                  <SelectItem value="red">
                    {t("goals.fe.progressRed")}
                  </SelectItem>
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
                <SelectValue placeholder={t("common.fe.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    {t("goals.fe.allCategories")}
                  </SelectItem>
                  <SelectSeparator />
                  <SelectLabel>{t("common.fe.income")}</SelectLabel>
                  {INCOME_CATEGORIES_KEY.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category, customCategories)}
                    </SelectItem>
                  ))}
                  {customCategories!
                    .filter((c) => c.type === "income")
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
                className="col-span-full 2xl:col-auto 2xl:row-start-1"
              >
                {t("common.fe.reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <GoalsTable
        filteredGoals={filteredGoals}
        offsetHeight={calculatedHeight}
      />
    </>
  )
}
