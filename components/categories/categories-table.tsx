"use client"

import { useState } from "react"
import { MoreVerticalIcon, TagIcon } from "lucide-react"
import { useTranslations } from "next-intl"

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
import { useAppData } from "@/context/app-data-context"
import type { Category } from "@/lib/definitions"

interface CategoriesTableProps {
  filteredCategories: Category[]
  offsetHeight: number
}

export function CategoriesTable({
  filteredCategories,
  offsetHeight,
}: CategoriesTableProps) {
  const { customCategories } = useAppData()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const tCategoriesFE = useTranslations("categories.fe")
  const tCommonFE = useTranslations("common.fe")

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
                  <TagIcon />
                </EmptyMedia>
                <EmptyTitle>{tCategoriesFE("noCategoriesFound")}</EmptyTitle>
                <EmptyDescription>
                  {customCategories!.length === 0
                    ? tCategoriesFE("noCategoriesDescription")
                    : tCategoriesFE("noCategoriesFiltered")}
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
                    <TableHead>{tCategoriesFE("categoryName")}</TableHead>
                    <TableHead>{tCommonFE("description")}</TableHead>
                    <TableHead>{tCommonFE("type")}</TableHead>
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
                              ? "badge-green"
                              : "badge-red"
                          }
                        >
                          {category.type === "income"
                            ? tCommonFE("income")
                            : tCommonFE("expense")}
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
                              <MoreVerticalIcon />
                              <span className="sr-only">
                                {tCategoriesFE("openMenu")}
                              </span>
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
                              {tCommonFE("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedCategory(category)
                                setIsDeleteOpen(true)
                              }}
                            >
                              {tCommonFE("delete")}
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
            key={selectedCategory._id + "CategoryDialog"}
            category={selectedCategory}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteCategoryDialog
            key={selectedCategory._id + "DeleteCategoryDialog"}
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
