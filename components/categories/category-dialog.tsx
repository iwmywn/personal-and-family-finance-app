"use client"

import { useState } from "react"
import { customCategorySchema, type CustomCategoryFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CustomCategory } from "@/lib/definitions"
import { useCustomCategories } from "@/lib/swr"

interface CategoryDialogProps {
  category?: CustomCategory
  open: boolean
  setOpen: (open: boolean) => void
}

export function CategoryDialog({
  category,
  open,
  setOpen,
}: CategoryDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { customCategories, mutate } = useCustomCategories()
  const [categoryType, setCategoryType] = useState<"income" | "expense">(
    category?.type || "income"
  )
  const tCategoriesFE = useTranslations("categories.fe")
  const tCommonFE = useTranslations("common.fe")
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
          customCategories: customCategories!.map((c) =>
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
          customCategories: [
            {
              _id: `temp-id`,
              userId: "temp-user",
              categoryKey: `custom_${values.type}_temp`,
              ...values,
            },
            ...customCategories!,
          ],
        })
        toast.success(success)
        form.reset({
          type: "income",
          label: "",
          description: "",
        })
        setCategoryType("income")
        setOpen(false)
      }
    }

    setIsLoading(false)
  }

  const handleTypeChange = (type: string) => {
    const categoryType = type as "income" | "expense"
    setCategoryType(categoryType)
    form.setValue("type", categoryType)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category
              ? tCategoriesFE("editCategory")
              : tCategoriesFE("addCategory")}
          </DialogTitle>
          <DialogDescription>
            {category
              ? tCategoriesFE("editCategoryDescription")
              : tCategoriesFE("addCategoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={categoryType} onValueChange={handleTypeChange}>
              <TabsList className="w-full">
                <TabsTrigger
                  disabled={category && category.type === "expense" && true}
                  value="income"
                >
                  {tCommonFE("income")}
                </TabsTrigger>
                <TabsTrigger
                  disabled={category && category.type === "income" && true}
                  value="expense"
                >
                  {tCommonFE("expense")}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tCategoriesFE("categoryName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tCategoriesFE("categoryNamePlaceholder")}
                      {...field}
                    />
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
                  <FormLabel>{tCommonFE("description")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupTextarea
                        placeholder={tCategoriesFE(
                          "categoryDescriptionPlaceholder"
                        )}
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
                <Button variant="outline">{tCommonFE("cancel")}</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}{" "}
                {category ? tCommonFE("update") : tCommonFE("add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
