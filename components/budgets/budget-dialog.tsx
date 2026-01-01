"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useExtracted } from "next-intl"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryFormSelect } from "@/components/category-form-select"
import { CurrencyInput } from "@/components/currency-input"
import { FormButton } from "@/components/form-button"
import { useAppData } from "@/context/app-data-context"
import { useFormatDate } from "@/hooks/use-format-date"
import { useSchemas } from "@/hooks/use-schemas"
import { CURRENCIES, CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"
import type { Budget } from "@/lib/definitions"
import { cn, isZeroDecimalCurrency, localDateToUTCMidnight } from "@/lib/utils"
import type { BudgetFormValues } from "@/schemas/types"

interface BudgetDialogProps {
  budget?: Budget
  open: boolean
  setOpen: (open: boolean) => void
}

export function BudgetDialog({ budget, open, setOpen }: BudgetDialogProps) {
  const [startCalendarOpen, setStartCalendarOpen] = useState<boolean>(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState<boolean>(false)
  const t = useExtracted()
  const { createBudgetSchema } = useSchemas()
  const { user } = useAppData()
  const formatDate = useFormatDate()
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(createBudgetSchema()),
    defaultValues: {
      categoryKey: budget?.categoryKey || "",
      currency: budget?.currency ?? (user.currency as AppCurrency),
      allocatedAmount: budget?.allocatedAmount
        ? parseFloat(budget.allocatedAmount)
            .toFixed(isZeroDecimalCurrency(budget.currency) ? 0 : 2)
            .toString()
        : "",
      startDate: budget?.startDate ? new Date(budget.startDate) : undefined,
      endDate: budget?.endDate ? new Date(budget.endDate) : undefined,
    },
  })

  const startDate = useWatch({
    control: form.control,
    name: "startDate",
  })

  const endDate = useWatch({
    control: form.control,
    name: "endDate",
  })

  async function onSubmit(values: BudgetFormValues) {
    const parsedValues = createBudgetSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    const data = {
      ...values,
      startDate: localDateToUTCMidnight(values.startDate),
      endDate: localDateToUTCMidnight(values.endDate),
    }

    if (budget) {
      const { success, error } = await updateBudget(budget._id, data)

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createBudget(data)

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        form.reset({
          categoryKey: "",
          allocatedAmount: "",
          startDate: undefined,
          endDate: undefined,
        })
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {budget ? t("Edit Budget") : t("Add Budget")}
          </DialogTitle>
          <DialogDescription>
            {budget
              ? t("Update budget information.")
              : t("Create a budget for a category to track your spending.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CategoryFormSelect control={form.control} type="expense" />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Currency")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("allocatedAmount", "")
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {CURRENCY_CONFIG[currency].displayName}
                        </SelectItem>
                      ))}
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
                  <FormLabel>{t("Amount")}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      currency={form.getValues("currency")}
                      value={field.value}
                      onChange={field.onChange}
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
                  <FormLabel>{t("Start Date")}</FormLabel>
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
                            <span>{t("Select Date")}</span>
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
                          date < new Date(2025, 8, 1)
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
                  <FormLabel>{t("End Date")}</FormLabel>
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
                            <span>{t("Select Date")}</span>
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
                          date < new Date(2025, 8, 1)
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
                <Button variant="outline">{t("Cancel")}</Button>
              </DialogClose>
              <FormButton
                isSubmitting={form.formState.isSubmitting}
                text={budget ? t("Update") : t("Add")}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
