"use client"

import { useState } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { CategoriesTable } from "@/components/categories/categories-table"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useCustomCategories, useUser } from "@/lib/swr"

export default function CategoryFilters() {
  const { user, isUserLoading } = useUser()
  const { categories: customCategories, isCategoriesLoading } =
    useCustomCategories()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  )
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)

  if (isUserLoading || isCategoriesLoading) {
    return (
      <div className="center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) {
    return <div className="center">Không thể tải thông tin người dùng!</div>
  }

  if (!customCategories) {
    return <div className="center">Không thể tải danh mục!</div>
  }

  const filteredCategories = customCategories.filter((category) => {
    const matchesFilter = filterType === "all" || category.type === filterType
    const matchesSearch = category.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const handleResetFilters = () => {
    setSearchTerm("")
    setFilterType("all")
  }

  const hasActiveFilters = searchTerm !== "" || filterType !== "all"

  return (
    <>
      <div className="space-y-4">
        <div
          ref={registerRef}
          className="flex items-center justify-between gap-2"
        >
          <div>
            <div className="text-xl font-semibold">Danh mục tùy chỉnh</div>
            <div className="text-muted-foreground text-sm">
              Quản lý các danh mục tùy chỉnh cho giao dịch của bạn.
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Thêm</Button>
        </div>
        <Card ref={registerRef}>
          <CardContent>
            <div
              className={`grid grid-cols-1 ${
                hasActiveFilters
                  ? "md:grid-cols-[1fr_auto_auto]"
                  : "md:grid-cols-[1fr_auto]"
              } gap-4`}
            >
              <InputGroup
                className={`${searchTerm !== "" && "border-primary"}`}
              >
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
          customCategories={customCategories}
          filteredCategories={filteredCategories}
          offsetHeight={calculatedHeight}
        />
      </div>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
