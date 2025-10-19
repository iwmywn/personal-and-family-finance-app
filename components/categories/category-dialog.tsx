"use client"

import { useState } from "react"
import { customCategorySchema, type CustomCategoryFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createCustomCategory,
  updateCustomCategory,
} from "@/actions/categories"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { CustomCategory } from "@/lib/definitions"
import { useCustomCategories } from "@/lib/swr"

interface CategoryDialogProps {
  category?: CustomCategory
}

export function CategoryDialog({ category }: CategoryDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { categories: customCategories, mutate } = useCustomCategories()

  const form = useForm<CustomCategoryFormValues>({
    resolver: zodResolver(customCategorySchema),
    defaultValues: {
      type: category?.type || "income",
      label: category?.label || "",
      description: category?.description || "",
    },
  })

  async function onSubmit(values: CustomCategoryFormValues) {
    setIsLoading(true)

    if (category) {
      const { success, error } = await updateCustomCategory(
        category._id,
        values
      )

      if (error || !success) {
        toast.error(error)
      } else {
        mutate({
          categories: customCategories!.map((c) =>
            c._id === category._id ? { ...c, ...values } : c
          ),
        })
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createCustomCategory(values)

      if (error || !success) {
        toast.error(error)
      } else {
        mutate({
          categories: [
            ...customCategories!,
            {
              _id: `temp-id`,
              userId: "temp-user",
              categoryId: `custom_${values.type}_temp`,
              ...values,
            },
          ],
        })
        toast.success(success)
        form.reset({
          type: "income",
          label: "",
          description: "",
        })
        setOpen(false)
      }
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <div className="h-full w-full px-2 py-1.5">Chỉnh sửa</div>
        ) : (
          <Button>Thêm</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Cập nhật thông tin danh mục."
              : "Thêm danh mục tùy chỉnh cho giao dịch của bạn."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại danh mục</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!category}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Thu nhập</SelectItem>
                      <SelectItem value="expense">Chi tiêu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên danh mục..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupTextarea
                        placeholder="Nhập mô tả cho danh mục..."
                        maxLength={200}
                        {...field}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="text-muted-foreground text-xs">
                          {field.value?.length || 0}/200
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}{" "}
                {category ? "Cập nhật" : "Thêm danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
