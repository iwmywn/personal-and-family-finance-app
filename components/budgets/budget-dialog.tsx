"use client"

import { useState } from "react"
import { createBudgetSchema, type BudgetFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { createBudget, updateBudget } from "@/actions/budget.actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import type { Budget } from "@/lib/definitions"
import { cn, normalizeToUTCDate } from "@/lib/utils"

interface BudgetDialogProps {
  budget?: Budget
  open: boolean
  setOpen: (open: boolean) => void
}

export function BudgetDialog({ budget, open, setOpen }: BudgetDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [startCalendarOpen, setStartCalendarOpen] = useState<boolean>(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState<boolean>(false)
  const { registerRef, calculatedWidth } = useDynamicSizeAuto()
  const t = useTranslations()
  const formatDate = useFormatDate()
  const schema = createBudgetSchema(t)
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryKey: budget?.categoryKey || "",
      allocatedAmount: budget?.allocatedAmount || 0,
      startDate: budget?.startDate ? new Date(budget.startDate) : undefined,
      endDate: budget?.endDate ? new Date(budget.endDate) : undefined,
    },
  })

  const { customCategories } = useAppData()
  const { getCategoryLabel, getCategoriesWithDetails } = useCategoryI18n()

  const startDate = useWatch({
    control: form.control,
    name: "startDate",
  })

  const endDate = useWatch({
    control: form.control,
    name: "endDate",
  })

  async function onSubmit(values: BudgetFormValues) {
    setIsLoading(true)

    if (budget) {
      const { success, error } = await updateBudget(budget._id, {
        ...values,
        startDate: normalizeToUTCDate(values.startDate),
        endDate: normalizeToUTCDate(values.endDate),
      })

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createBudget({
        ...values,
        startDate: normalizeToUTCDate(values.startDate),
        endDate: normalizeToUTCDate(values.endDate),
      })

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        form.reset({
          categoryKey: "",
          allocatedAmount: 0,
          startDate: undefined,
          endDate: undefined,
        })
        setOpen(false)
      }
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent ref={registerRef} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {budget ? t("budgets.fe.editBudget") : t("budgets.fe.addBudget")}
          </DialogTitle>
          <DialogDescription>
            {budget
              ? t("budgets.fe.editBudgetDescription")
              : t("budgets.fe.addBudgetDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("budgets.fe.category")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("budgets.fe.selectCategory")}
                        >
                          {field.value
                            ? getCategoryLabel(field.value, customCategories)
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      style={{
                        maxWidth: `calc(${calculatedWidth}px - 3.125rem)`,
                      }}
                    >
                      {getCategoriesWithDetails("expense").map((c) => (
                        <SelectItem key={c.categoryKey} value={c.categoryKey}>
                          <div className="flex flex-col">
                            <span className="font-medium">{c.label}</span>
                            <span className="text-muted-foreground wrap-anywhere">
                              {c.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {customCategories &&
                        customCategories.filter((c) => c.type === "expense")
                          .length > 0 && (
                          <>
                            <SelectSeparator />
                            {customCategories
                              .filter((c) => c.type === "expense")
                              .map((c) => (
                                <SelectItem key={c._id} value={c.categoryKey}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {c.label}
                                    </span>
                                    <span className="text-muted-foreground wrap-anywhere">
                                      {c.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </>
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allocatedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.fe.amount")} (VND)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="0"
                      value={
                        field.value ? field.value.toLocaleString("vi-VN") : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\./g, "")
                        const numericValue = Number.parseInt(rawValue) || 0
                        field.onChange(numericValue)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("budgets.fe.startDate")}</FormLabel>
                  <Popover
                    open={startCalendarOpen}
                    onOpenChange={setStartCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          {startDate ? (
                            formatDate(startDate)
                          ) : (
                            <span>{t("common.fe.selectDate")}</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        autoFocus
                        mode="single"
                        selected={startDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          field.onChange(date)
                          setStartCalendarOpen(false)
                        }}
                        disabled={(date) =>
                          (endDate && date > endDate) ||
                          date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("budgets.fe.endDate")}</FormLabel>
                  <Popover
                    open={endCalendarOpen}
                    onOpenChange={setEndCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          {endDate ? (
                            formatDate(endDate)
                          ) : (
                            <span>{t("common.fe.selectDate")}</span>
                          )}
                          <CalendarIcon />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        autoFocus
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          field.onChange(date)
                          setEndCalendarOpen(false)
                        }}
                        disabled={(date) =>
                          (startDate && date <= startDate) ||
                          date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("common.fe.cancel")}</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}{" "}
                {budget ? t("common.fe.update") : t("common.fe.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
