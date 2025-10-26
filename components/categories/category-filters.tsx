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
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoriesTable } from "@/components/categories/categories-table"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useCustomCategories } from "@/lib/swr"
import { filterCustomCategories } from "@/lib/utils/filters"

export function CategoryFilters() {
  const { customCategories } = useCustomCategories()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  const filteredCategories = useMemo(() => {
    return filterCustomCategories(customCategories!, {
      searchTerm,
      filterType,
    })
  }, [customCategories, searchTerm, filterType])

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
                placeholder="Tìm kiếm danh mục..."
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
                <SelectValue placeholder="Loại danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại danh mục</SelectItem>
                <SelectSeparator />
                <SelectItem value="income">Thu nhập</SelectItem>
                <SelectItem value="expense">Chi tiêu</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="default"
                onClick={handleResetFilters}
                className="w-full md:w-fit"
              >
                Đặt lại
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
