"use client"

import { useState } from "react"
import { MoreVertical, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import type { CustomCategory } from "@/lib/definitions"
import { useCustomCategories } from "@/lib/swr"

interface CategoriesTableProps {
  filteredCategories: CustomCategory[]
  offsetHeight: number
}

export function CategoriesTable({
  filteredCategories,
  offsetHeight,
}: CategoriesTableProps) {
  const { categories: customCategories } = useCustomCategories()
  const [selectedCategory, setSelectedCategory] =
    useState<CustomCategory | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  return (
    <>
      <Card>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <Empty
              style={{
                minHeight: `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Tag />
                </EmptyMedia>
                <EmptyTitle>Không có danh mục nào</EmptyTitle>
                <EmptyDescription>
                  {customCategories!.length === 0
                    ? "Bạn chưa tạo danh mục tùy chỉnh nào. Hãy thêm danh mục đầu tiên!"
                    : "Không tìm thấy danh mục nào phù hợp với bộ lọc của bạn."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div
              className="overflow-auto rounded-md border [&>div]:overflow-x-visible!"
              style={{
                maxHeight: `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow className="[&>th]:text-center">
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id} className="[&>td]:text-center">
                      <TableCell className="min-w-38 wrap-anywhere whitespace-normal">
                        {category.label}
                      </TableCell>
                      <TableCell className="max-w-md min-w-52 wrap-anywhere whitespace-normal">
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            category.type === "income"
                              ? "badge-income"
                              : "badge-expense"
                          }
                        >
                          {category.type === "income" ? "Thu nhập" : "Chi tiêu"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="dark:hover:bg-input/50"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreVertical />
                              <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedCategory(category)
                                setIsEditOpen(true)
                              }}
                            >
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedCategory(category)
                                setIsDeleteOpen(true)
                              }}
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCategory && (
        <>
          <CategoryDialog
            key={selectedCategory._id}
            category={selectedCategory}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteCategoryDialog
            key={selectedCategory._id}
            categoryId={selectedCategory._id}
            categoryLabel={selectedCategory.label}
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
          />
        </>
      )}
    </>
  )
}
