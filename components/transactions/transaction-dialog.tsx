"use client"

import { useState } from "react"
import { transactionSchema, type TransactionFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Edit } from "lucide-react"
import { vi } from "react-day-picker/locale"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createTransaction, updateTransaction } from "@/actions/transactions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import {
  getCategoriesByType,
  getCategoryDescription,
  getCategoryLabel,
} from "@/lib/categories"
import type { Transaction } from "@/lib/definitions"
import { useTransactions } from "@/lib/swr"
import { cn } from "@/lib/utils"

interface TransactionDialogProps {
  transaction?: Transaction
}

const incomeCategories = getCategoriesByType("income").map((category) => ({
  label: getCategoryLabel(category),
  description: getCategoryDescription(category),
  category,
}))

const expenseCategories = getCategoriesByType("expense").map((category) => ({
  label: getCategoryLabel(category),
  description: getCategoryDescription(category),
  category,
}))

export function TransactionDialog({ transaction }: TransactionDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    transaction?.type || "expense"
  )
  const { registerRef, calculatedWidth } = useDynamicSizeAuto()
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || "expense",
      amount: transaction?.amount || 0,
      description: transaction?.description || "",
      category: transaction?.category || undefined,
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  })

  const { transactions, mutate } = useTransactions()

  async function onSubmit(values: TransactionFormValues) {
    setIsLoading(true)

    if (transaction) {
      const { success, error } = await updateTransaction(
        transaction._id,
        values
      )

      if (error || !success) {
        toast.error(error)
      } else {
        mutate({
          transactions: transactions!.map((t) =>
            t._id === transaction._id
              ? { ...t, ...values, date: values.date }
              : t
          ),
        })
        toast.success(success)
        setOpen(false)
      }
    } else {
      const { success, error } = await createTransaction(values)

      if (error || !success) {
        toast.error(error)
      } else {
        mutate({
          transactions: [
            ...transactions!,
            {
              _id: `temp-id`,
              userId: "temp-user",
              ...values,
            },
          ],
        })
        toast.success(success)
        form.reset({
          type: transactionType,
          amount: 0,
          description: "",
          category: undefined,
          date: new Date(),
        })
        setOpen(false)
      }
    }

    setIsLoading(false)
  }

  const handleTypeChange = (type: string) => {
    const transactionType = type as "income" | "expense"
    setTransactionType(transactionType)
    form.setValue("type", transactionType)
    form.resetField("category", { defaultValue: undefined })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {transaction ? (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Chỉnh sửa giao dịch</span>
          </Button>
        ) : (
          <Button>Thêm giao dịch</Button>
        )}
      </DialogTrigger>
      <DialogContent ref={registerRef} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Cập nhật thông tin giao dịch"
              : "Thêm thu nhập hoặc chi tiêu của bạn để theo dõi tài chính cá nhân."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={transactionType} onValueChange={handleTypeChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  disabled={
                    transaction && transaction.type === "income" && true
                  }
                  value="expense"
                >
                  Chi tiêu
                </TabsTrigger>
                <TabsTrigger
                  disabled={
                    transaction && transaction.type === "expense" && true
                  }
                  value="income"
                >
                  Thu nhập
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục chi tiêu</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn danh mục chi tiêu">
                              {field.value
                                ? getCategoryLabel(field.value)
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
                          {expenseCategories.map((c) => (
                            <SelectItem key={c.category} value={c.category}>
                              <div className="flex flex-col">
                                <span className="font-medium ">{c.label}</span>
                                <span className="text-muted-foreground">
                                  {c.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="income" className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục thu nhập</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn danh mục thu nhập">
                              {field.value
                                ? getCategoryLabel(field.value)
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
                          {incomeCategories.map((c) => (
                            <SelectItem key={c.category} value={c.category}>
                              <div className="flex flex-col">
                                <span className="font-medium">{c.label}</span>
                                <span className="text-muted-foreground">
                                  {c.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền (VND)</FormLabel>
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
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả cho giao dịch..."
                      className="resize-none"
                      {...field}
                    />
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
                  <FormLabel>Ngày giao dịch</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày</span>
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
                        locale={vi}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}{" "}
                {transaction ? "Cập nhật" : "Thêm giao dịch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
