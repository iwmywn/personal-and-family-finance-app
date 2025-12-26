"use client"

import { useExtracted } from "next-intl"
import type { Control, FieldValues, Path } from "react-hook-form"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormLink } from "@/components/form-link"
import { useCategory } from "@/hooks/use-category"
import type { CategoryType } from "@/lib/categories"

interface CategoryFormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>
  type: CategoryType
  calculatedWidth: number
  showDescription?: boolean
}

export function CategoryFormSelect<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  type,
  calculatedWidth,
  showDescription = false,
}: CategoryFormSelectProps<TFieldValues>) {
  const t = useExtracted()
  const { getCategoryLabel, getCategoriesByType } = useCategory()

  return (
    <FormField
      control={control}
      name={"categoryKey" as Path<TFieldValues>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Category")}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select Category")}>
                  {field.value ? getCategoryLabel(field.value) : null}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent
              style={{ maxWidth: `calc(${calculatedWidth}px - 3.125rem)` }}
            >
              {getCategoriesByType(type).map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground wrap-anywhere">
                      {c.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showDescription && (
            <FormDescription>
              {t("Cannot find a suitable category?")}{" "}
              <FormLink href="/categories" className="text-foreground/85">
                {t("Create Custom Category")}
              </FormLink>
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
