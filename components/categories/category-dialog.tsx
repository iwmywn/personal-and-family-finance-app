"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useExtracted } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createCustomCategory,
  updateCustomCategory,
} from "@/actions/category.actions"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormButton } from "@/components/form-button"
import { useSchemas } from "@/hooks/use-schemas"
import type { CategoryType } from "@/lib/categories"
import type { Category } from "@/lib/definitions"
import type { CategoryFormValues } from "@/schemas/types"

interface CategoryDialogProps {
  category?: Category
  open: boolean
  setOpen: (open: boolean) => void
}

export function CategoryDialog({
  category,
  open,
  setOpen,
}: CategoryDialogProps) {
  const [type, setType] = useState<CategoryType>(category?.type || "income")
  const t = useExtracted()
  const { createCategorySchema } = useSchemas()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategorySchema()),
    defaultValues: {
      type: category?.type || "income",
      label: category?.label || "",
      description: category?.description || "",
    },
  })

  async function onSubmit(values: CategoryFormValues) {
    const parsedValues = createCategorySchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    if (category) {
      const { success, error } = await updateCustomCategory(
        category._id,
        values
      )

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createCustomCategory(values)

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        form.reset({
          type: type,
          label: "",
          description: "",
        })
        setOpen(false)
      }
    }
  }

  const handleTypeChange = (type: CategoryType) => {
    setType(type)
    form.setValue("type", type)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? t("Edit Category") : t("Add Category")}
          </DialogTitle>
          <DialogDescription>
            {category
              ? t("Update custom category information.")
              : t("Create a custom category for your transactions.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              value={type}
              onValueChange={(value) => handleTypeChange(value as CategoryType)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="income">{t("Income")}</TabsTrigger>
                <TabsTrigger value="expense">{t("Expense")}</TabsTrigger>
              </TabsList>
            </Tabs>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Category Name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("e.g. Salary, Groceries")}
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
                  <FormLabel>{t("Description")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupTextarea
                        placeholder={t("Enter a description...")}
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
                <Button variant="outline">{t("Cancel")}</Button>
              </DialogClose>
              <FormButton
                isSubmitting={form.formState.isSubmitting}
                text={category ? t("Update") : t("Add")}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
