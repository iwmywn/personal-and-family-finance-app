"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useExtracted } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import {
  createTransaction,
  updateTransaction,
} from "@/actions/transaction.actions"
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
import { useFormatDate } from "@/hooks/use-format-date"
import { useSchemas } from "@/hooks/use-schemas"
import type { CategoryType } from "@/lib/categories"
import { CURRENCIES, CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"
import type { Transaction } from "@/lib/definitions"
import { cn, isZeroDecimalCurrency, localDateToUTCMidnight } from "@/lib/utils"
import type { TransactionFormValues } from "@/schemas/types"

interface TransactionDialogProps {
  transaction?: Transaction
  open: boolean
  setOpen: (open: boolean) => void
}

export function TransactionDialog({
  transaction,
  open,
  setOpen,
}: TransactionDialogProps) {
  const [type, setType] = useState<CategoryType>(transaction?.type || "income")
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const t = useExtracted()
  const { createTransactionSchema } = useSchemas()
  const { user } = useAppData()
  const formatDate = useFormatDate()
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(createTransactionSchema()),
    defaultValues: {
      type: transaction?.type || "income",
      currency: transaction?.currency ?? (user.currency as AppCurrency),
      amount: transaction?.amount
        ? parseFloat(transaction.amount)
            .toFixed(isZeroDecimalCurrency(transaction.currency) ? 0 : 2)
            .toString()
        : "",
      description: transaction?.description || "",
      categoryKey: transaction?.categoryKey || "",
      date: transaction?.date ? new Date(transaction.date) : undefined,
    },
  })

  const selectedDate = useWatch({
    control: form.control,
    name: "date",
  })

  async function onSubmit(values: TransactionFormValues) {
    const parsedValues = createTransactionSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    const data = {
      ...values,
      date: localDateToUTCMidnight(values.date),
    }

    if (transaction) {
      const { success, error } = await updateTransaction(transaction._id, data)

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createTransaction(data)

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        form.reset({
          type: type,
          amount: "",
          description: "",
          categoryKey: "",
          date: undefined,
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
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? t("Edit Transaction") : t("Add Transaction")}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? t("Update transaction information.")
              : t(
                  "Add your income or expense to track your personal finances."
                )}
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
                  showDescription
                />
              </TabsContent>

              <TabsContent value="expense" className="space-y-4">
                <CategoryFormSelect
                  control={form.control}
                  type="expense"
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
                      value={field.value}
                      onChange={field.onChange}
                      currency={form.getValues("currency")}
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
                        placeholder={t(
                          "Enter a description for the transaction..."
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Date")}</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          {selectedDate ? (
                            formatDate(selectedDate)
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
                        selected={selectedDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          field.onChange(date)
                          setCalendarOpen(false)
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date(2025, 8, 1)
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
                text={transaction ? t("Update") : t("Add")}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
