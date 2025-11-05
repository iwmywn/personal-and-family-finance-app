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
import { CategoriesTable } from "@/components/categories/categories-table"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { filterCustomCategories } from "@/lib/filters"
import { useCustomCategories } from "@/lib/swr"

export function CategoryFilters() {
  const { customCategories } = useCustomCategories()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const tCategoriesFE = useTranslations("categories.fe")
  const tCommonFE = useTranslations("common.fe")

  const filteredCategories = filterCustomCategories(customCategories!, {
    searchTerm,
    filterType,
  })

  const handleResetFilters = () => {
    setSearchTerm("")
    setFilterType("all")
  }

  const hasActiveFilters = searchTerm !== "" || filterType !== "all"

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
                placeholder={tCategoriesFE("searchPlaceholder")}
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
              value={filterType}
              onValueChange={(value: "all" | "income" | "expense") =>
                setFilterType(value)
              }
            >
              <SelectTrigger
                className={`w-full md:w-fit ${filterType !== "all" && "border-primary"}`}
              >
                <SelectValue placeholder={tCategoriesFE("categoryType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {tCategoriesFE("allCategoryTypes")}
                </SelectItem>
                <SelectSeparator />
                <SelectItem value="income">{tCommonFE("income")}</SelectItem>
                <SelectItem value="expense">{tCommonFE("expense")}</SelectItem>
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

      <CategoriesTable
        filteredCategories={filteredCategories}
        offsetHeight={calculatedHeight}
      />
    </>
  )
}
