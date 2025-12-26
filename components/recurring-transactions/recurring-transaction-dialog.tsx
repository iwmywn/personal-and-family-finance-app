"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useExtracted } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import {
  createRecurringTransaction,
  updateRecurringTransaction,
} from "@/actions/recurring.actions"
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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryFormSelect } from "@/components/category-form-select"
import { CurrencyInput } from "@/components/currency-input"
import { FormButton } from "@/components/form-button"
import { useAppData } from "@/context/app-data-context"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import { useSchemas } from "@/hooks/use-schemas"
import type { CategoryType } from "@/lib/categories"
import { CURRENCIES, CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"
import type { RecurringTransaction } from "@/lib/definitions"
import { cn, isZeroDecimalCurrency, normalizeToUTCDate } from "@/lib/utils"
import type { RecurringTransactionFormValues } from "@/schemas/types"

interface RecurringDialogProps {
  recurring?: RecurringTransaction
  open: boolean
  setOpen: (open: boolean) => void
}

export function RecurringTransactionDialog({
  recurring,
  open,
  setOpen,
}: RecurringDialogProps) {
  const [startCalendarOpen, setStartCalendarOpen] = useState<boolean>(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState<boolean>(false)
  const [type, setType] = useState<CategoryType>(recurring?.type || "income")
  const { registerRef, calculatedWidth } = useDynamicSizeAuto()
  const t = useExtracted()
  const { createRecurringTransactionSchema } = useSchemas()
  const { user } = useAppData()
  const formatDate = useFormatDate()
  const form = useForm<RecurringTransactionFormValues>({
    resolver: zodResolver(createRecurringTransactionSchema()),
    defaultValues: {
      type: recurring?.type || "income",
      categoryKey: recurring?.categoryKey || "",
      currency: recurring?.currency ?? (user.currency as AppCurrency),
      amount: recurring?.amount
        ? parseFloat(recurring.amount)
            .toFixed(isZeroDecimalCurrency(recurring.currency) ? 0 : 2)
            .toString()
        : "",
      description: recurring?.description || "",
      frequency: recurring?.frequency || "monthly",
      randomEveryXDays: recurring?.randomEveryXDays || undefined,
      startDate: recurring?.startDate
        ? new Date(recurring.startDate)
        : undefined,
      endDate: recurring?.endDate ? new Date(recurring.endDate) : undefined,
      lastGenerated: recurring?.lastGenerated
        ? new Date(recurring.lastGenerated)
        : undefined,
      isActive: recurring?.isActive ?? true,
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

  const frequency = useWatch({
    control: form.control,
    name: "frequency",
  })

  async function onSubmit(values: RecurringTransactionFormValues) {
    const parsedValues = createRecurringTransactionSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    if (recurring) {
      const { success, error } = await updateRecurringTransaction(
        recurring._id,
        {
          ...values,
          startDate: normalizeToUTCDate(values.startDate),
          endDate: values.endDate
            ? normalizeToUTCDate(values.endDate)
            : undefined,
        }
      )

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createRecurringTransaction({
        ...values,
        startDate: normalizeToUTCDate(values.startDate),
        endDate: values.endDate
          ? normalizeToUTCDate(values.endDate)
          : undefined,
      })

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        form.reset({
          type: type,
          categoryKey: "",
          amount: "",
          description: "",
          frequency: "monthly",
          randomEveryXDays: undefined,
          startDate: undefined,
          endDate: undefined,
          isActive: true,
        })
        setOpen(false)
      }
    }
  }

  const handleTypeChange = (type: CategoryType) => {
    setType(type)
    form.setValue("type", type)
    form.resetField("categoryKey", { defaultValue: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent ref={registerRef} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recurring
              ? t("Edit Recurring Transaction")
              : t("Add Recurring Transaction")}
          </DialogTitle>
          <DialogDescription>
            {recurring
              ? t("Update recurring transaction information.")
              : t("Create a recurring transaction.")}
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

              <TabsContent value="income" className="space-y-4">
                <CategoryFormSelect
                  control={form.control}
                  type="income"
                  calculatedWidth={calculatedWidth}
                  showDescription
                />
              </TabsContent>

              <TabsContent value="expense" className="space-y-4">
                <CategoryFormSelect
                  control={form.control}
                  type="expense"
                  calculatedWidth={calculatedWidth}
                  showDescription
                />
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Currency")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("amount", "")
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
              name="amount"
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

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Frequency")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value !== "random") {
                        form.setValue("randomEveryXDays", undefined)
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">{t("Daily")}</SelectItem>
                      <SelectItem value="weekly">{t("Weekly")}</SelectItem>
                      <SelectItem value="bi-weekly">
                        {t("Bi-Weekly")}
                      </SelectItem>
                      <SelectItem value="monthly">{t("Monthly")}</SelectItem>
                      <SelectItem value="quarterly">
                        {t("Quarterly")}
                      </SelectItem>
                      <SelectItem value="yearly">{t("Yearly")}</SelectItem>
                      <SelectItem value="random">{t("Random")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency === "random" && (
              <FormField
                control={form.control}
                name="randomEveryXDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Every X Days")}</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder={t("e.g. 15")}
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
            )}

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
                          (endDate && date > endDate) || date <= new Date()
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
                  <FormLabel>
                    {t("End Date")} ({t("Optional")})
                  </FormLabel>
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
                          onClick={() => {
                            if (!endDate) {
                              field.onChange(undefined)
                            }
                          }}
                        >
                          {endDate ? (
                            formatDate(endDate)
                          ) : (
                            <span>{t("No End Date")}</span>
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
                          (startDate && date <= startDate) || date <= new Date()
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
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Status")}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">{t("Active")}</SelectItem>
                      <SelectItem value="false">{t("Inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
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
                text={recurring ? t("Update") : t("Add")}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
