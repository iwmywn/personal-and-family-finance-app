"use client"

import { MoreVertical, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useMediaQuery } from "@/hooks/use-media-query"
import type { CustomCategory } from "@/lib/definitions"

interface CategoriesTableProps {
  customCategories: CustomCategory[]
  filteredCategories: CustomCategory[]
  offsetHeight: number
}

export function CategoriesTable({
  customCategories,
  filteredCategories,
  offsetHeight,
}: CategoriesTableProps) {
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")

  return (
    <Card>
      <CardContent>
        {filteredCategories.length === 0 ? (
          <Empty
            style={{
              minHeight: isLargeScreens
                ? "300px"
                : `calc(100vh - ${offsetHeight}px - 10rem)`,
            }}
          >
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Tag />
              </EmptyMedia>
              <EmptyTitle>Không có danh mục nào</EmptyTitle>
              <EmptyDescription>
                {customCategories.length === 0
                  ? "Bạn chưa tạo danh mục tùy chỉnh nào. Hãy thêm danh mục đầu tiên!"
                  : "Không tìm thấy danh mục nào phù hợp với bộ lọc của bạn."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div
            className="overflow-auto rounded-md border [&>div]:overflow-x-visible!"
            style={{
              maxHeight: isLargeScreens
                ? "300px"
                : `calc(100vh - ${offsetHeight}px - 10rem)`,
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
                    <TableCell className="max-w-36 min-w-24 wrap-anywhere whitespace-normal">
                      {category.label}
                    </TableCell>
                    <TableCell className="max-w-72 min-w-48 wrap-anywhere whitespace-normal">
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
                          <div className="dropdown-menu-item">
                            <CategoryDialog category={category} />
                          </div>
                          <div className="dropdown-menu-item text-destructive hover:bg-destructive/10">
                            <DeleteCategoryDialog
                              categoryId={category._id}
                              categoryLabel={category.label}
                            />
                          </div>
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
  )
}
