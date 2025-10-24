"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"
import { BasePage } from "@/components/layout/base-page"

export default function CategoriesPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">Danh mục</div>
            <div className="description">
              Quản lý các danh mục tùy chỉnh cho giao dịch của bạn.
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Thêm</Button>
        </div>

        <CategoryFilters />
      </BasePage>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
