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
  FormDescription,
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormButton } from "@/components/custom/form-button"
import { FormLink } from "@/components/custom/form-link"
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import { useSchemas } from "@/hooks/use-schemas"
import type { Transaction } from "@/lib/definitions"
import { cn, normalizeToUTCDate } from "@/lib/utils"
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
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    transaction?.type || "income"
  )
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const { registerRef, calculatedWidth } = useDynamicSizeAuto()
  const t = useExtracted()
  const { createTransactionSchema } = useSchemas()

  const formatDate = useFormatDate()
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(createTransactionSchema()),
    defaultValues: {
      type: transaction?.type || "income",
      amount: transaction?.amount || 0,
      description: transaction?.description || "",
      categoryKey: transaction?.categoryKey || "",
      date: transaction?.date ? new Date(transaction.date) : undefined,
    },
  })

  const { customCategories } = useAppData()
  const { getCategoryLabel, getCategoriesWithDetails } = useCategory()

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

    if (transaction) {
      const { success, error } = await updateTransaction(transaction._id, {
        ...values,
        date: normalizeToUTCDate(values.date),
      })

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createTransaction({
        ...values,
        date: normalizeToUTCDate(values.date),
      })

      if (error || !success) {
        toast.error(error)
      } else {
        toast.success(success)
        form.reset({
          type: "income",
          amount: 0,
          description: "",
          categoryKey: "",
          date: undefined,
        })
        setTransactionType("income")
        setOpen(false)
      }
    }
  }

  const handleTypeChange = (type: string) => {
    const transactionType = type as "income" | "expense"
    setTransactionType(transactionType)
    form.setValue("type", transactionType)
    form.resetField("categoryKey", { defaultValue: "" })
  }

  const renderCategorySelect = (type: "income" | "expense") => (
    <FormField
      control={form.control}
      name="categoryKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Category")}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select category")}>
                  {field.value ? getCategoryLabel(field.value) : null}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent
              style={{
                maxWidth: `calc(${calculatedWidth}px - 3.125rem)`,
              }}
            >
              {getCategoriesWithDetails(type).map((c) => (
                <SelectItem key={c.categoryKey} value={c.categoryKey}>
                  <div className="flex flex-col">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground wrap-anywhere">
                      {c.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {customCategories.filter((c) => c.type === type).length > 0 && (
                <>
                  <SelectSeparator />
                  {customCategories
                    .filter((c) => c.type === type)
                    .map((c) => (
                      <SelectItem key={c._id} value={c.categoryKey}>
                        <div className="flex flex-col">
                          <span className="font-medium">{c.label}</span>
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
          <FormDescription>
            {t("Cannot find a suitable category?")}{" "}
            <FormLink href="/categories" className="text-foreground/85">
              {t("Create Custom Category")}
            </FormLink>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent ref={registerRef} className="max-h-[85vh] overflow-y-auto">
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
            <Tabs value={transactionType} onValueChange={handleTypeChange}>
              <TabsList className="w-full">
                <TabsTrigger value="income">{t("Income")}</TabsTrigger>
                <TabsTrigger value="expense">{t("Expense")}</TabsTrigger>
              </TabsList>

              <TabsContent value="income" className="space-y-4">
                {renderCategorySelect("income")}
              </TabsContent>

              <TabsContent value="expense" className="space-y-4">
                {renderCategorySelect("expense")}
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Amount")} (VND)</FormLabel>
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
                            <span>{t("Select date")}</span>
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
                          date > new Date() || date < new Date("1900-01-01")
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
