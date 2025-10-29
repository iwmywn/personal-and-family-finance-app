"use client"

import { useState } from "react"
import { createTransactionSchema, type TransactionFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { createTransaction, updateTransaction } from "@/actions/transactions"
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormLink } from "@/components/custom/form-link"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { getCategoriesWithDetails, getCategoryLabel } from "@/lib/categories"
import type { Transaction } from "@/lib/definitions"
import { useCustomCategories, useTransactions } from "@/lib/swr"
import { cn, formatDate, normalizeToUTCDate } from "@/lib/utils"

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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    transaction?.type || "income"
  )
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
  const { registerRef, calculatedWidth } = useDynamicSizeAuto()
  const tTransactionsFE = useTranslations("transactions.fe")
  const tCommonFE = useTranslations("common.fe")
  const tSchemasTransaction = useTranslations("schemas.transaction")
  const schema = createTransactionSchema(tSchemasTransaction)
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction?.type || "income",
      amount: transaction?.amount || 0,
      description: transaction?.description || "",
      categoryKey: transaction?.categoryKey || "",
      date: transaction?.date ? new Date(transaction.date) : undefined,
    },
  })

  const { transactions, mutate } = useTransactions()
  const { customCategories } = useCustomCategories()

  const selectedDate = useWatch({
    control: form.control,
    name: "date",
  })

  async function onSubmit(values: TransactionFormValues) {
    setIsLoading(true)

    if (transaction) {
      const { success, error } = await updateTransaction(transaction._id, {
        ...values,
        date: normalizeToUTCDate(values.date),
      })

      if (error || !success) {
        toast.error(error)
      } else {
        mutate({
          transactions: transactions!.map((t) =>
            t._id === transaction._id ? { ...t, ...values } : t
          ),
        })
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
        mutate({
          transactions: [
            {
              _id: `temp-id`,
              userId: "temp-user",
              ...values,
            },
            ...transactions!,
          ],
        })
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

    setIsLoading(false)
  }

  const handleTypeChange = (type: string) => {
    const transactionType = type as "income" | "expense"
    setTransactionType(transactionType)
    form.setValue("type", transactionType)
    form.resetField("categoryKey", { defaultValue: "" })
  }

  const renderCategorySelect = (type: "income" | "expense") => {
    const typeLabel =
      type === "income"
        ? tCommonFE("income").toLowerCase()
        : tCommonFE("expense").toLowerCase()
    const placeholder = tTransactionsFE("selectCategory", { type: typeLabel })

    return (
      <FormField
        control={form.control}
        name="categoryKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {tCommonFE("category")} {typeLabel}
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder}>
                    {field.value
                      ? getCategoryLabel(field.value, customCategories)
                      : null}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent
                align="start"
                style={{
                  maxWidth: `calc(${calculatedWidth}px - 3.125rem)`,
                }}
              >
                <SelectGroup>
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
                  {customCategories &&
                    customCategories.filter((c) => c.type === type).length >
                      0 && (
                      <>
                        <SelectLabel>
                          {tTransactionsFE("customCategories")}
                        </SelectLabel>
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
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormDescription>
              {tTransactionsFE("noCategoryFound")}{" "}
              <FormLink href="/categories" className="text-foreground/85">
                {tTransactionsFE("createCustomCategory")}
              </FormLink>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent ref={registerRef} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction
              ? tTransactionsFE("editTransaction")
              : tTransactionsFE("addTransaction")}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? tTransactionsFE("editTransactionDescription")
              : tTransactionsFE("addTransactionDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={transactionType} onValueChange={handleTypeChange}>
              <TabsList className="w-full">
                <TabsTrigger value="income">{tCommonFE("income")}</TabsTrigger>
                <TabsTrigger value="expense">
                  {tCommonFE("expense")}
                </TabsTrigger>
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
                  <FormLabel>{tTransactionsFE("amount")} (VND)</FormLabel>
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
                  <FormLabel>{tCommonFE("description")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupTextarea
                        placeholder={tTransactionsFE("descriptionPlaceholder")}
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
                <FormItem className="flex flex-col">
                  <FormLabel>{tTransactionsFE("date")}</FormLabel>
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
                            <span>{tCommonFE("selectDate")}</span>
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
                <Button variant="outline">{tCommonFE("cancel")}</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}{" "}
                {transaction ? tCommonFE("update") : tCommonFE("add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
