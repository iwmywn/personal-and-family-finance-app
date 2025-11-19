"use client"

import { useState } from "react"
import {
  createRecurringTransactionSchema,
  type RecurringTransactionFormValues,
} from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"
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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormLink } from "@/components/custom/form-link"
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import { useWeekdaysI18n } from "@/hooks/use-weekdays-i18n"
import type { RecurringTransaction } from "@/lib/definitions"
import { cn, normalizeToUTCDate } from "@/lib/utils"

interface RecurringDialogProps {
  recurring?: RecurringTransaction
  open: boolean
  setOpen: (open: boolean) => void
}

export function RecurringDialog({
  recurring,
  open,
  setOpen,
}: RecurringDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [startCalendarOpen, setStartCalendarOpen] = useState<boolean>(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState<boolean>(false)
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    recurring?.type || "income"
  )
  const { registerRef, calculatedWidth } = useDynamicSizeAuto()
  const t = useTranslations()
  const formatDate = useFormatDate()
  const schema = createRecurringTransactionSchema(t)
  const form = useForm<RecurringTransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: recurring?.type || "income",
      categoryKey: recurring?.categoryKey || "",
      amount: recurring?.amount || 0,
      description: recurring?.description || "",
      frequency: recurring?.frequency || "monthly",
      weekday: recurring?.weekday ?? undefined,
      dayOfMonth: recurring?.dayOfMonth || undefined,
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

  const frequency = useWatch({
    control: form.control,
    name: "frequency",
  })

  const weekdays = useWeekdaysI18n()

  const handleTypeChange = (type: string) => {
    const transactionType = type as "income" | "expense"
    setTransactionType(transactionType)
    form.setValue("type", transactionType)
    form.resetField("categoryKey", { defaultValue: "" })
  }

  async function onSubmit(values: RecurringTransactionFormValues) {
    setIsLoading(true)

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
          type: "income",
          categoryKey: "",
          amount: 0,
          description: "",
          frequency: "monthly",
          weekday: undefined,
          dayOfMonth: undefined,
          randomEveryXDays: undefined,
          startDate: undefined,
          endDate: undefined,
          isActive: true,
        })
        setOpen(false)
      }
    }

    setIsLoading(false)
  }

  const renderCategorySelect = (type: "income" | "expense") => (
    <FormField
      control={form.control}
      name="categoryKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("common.fe.category")}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("common.fe.selectCategory")}>
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
            {t("transactions.fe.noCategoryFound")}{" "}
            <FormLink href="/categories" className="text-foreground/85">
              {t("transactions.fe.createCustomCategory")}
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
            {recurring
              ? t("recurring.fe.editRecurring")
              : t("recurring.fe.addRecurring")}
          </DialogTitle>
          <DialogDescription>
            {recurring
              ? t("recurring.fe.editRecurringDescription")
              : t("recurring.fe.addRecurringDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={transactionType} onValueChange={handleTypeChange}>
              <TabsList className="w-full">
                <TabsTrigger value="income">
                  {t("common.fe.income")}
                </TabsTrigger>
                <TabsTrigger value="expense">
                  {t("common.fe.expense")}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.fe.description")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupTextarea
                        placeholder={t(
                          "transactions.fe.descriptionPlaceholder"
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("recurring.fe.frequency")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value !== "weekly" && value !== "bi-weekly") {
                        form.setValue("weekday", undefined)
                      }
                      if (
                        value !== "monthly" &&
                        value !== "quarterly" &&
                        value !== "yearly"
                      ) {
                        form.setValue("dayOfMonth", undefined)
                      }
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
                      <SelectItem value="daily">
                        {t("recurring.fe.frequencyDaily")}
                      </SelectItem>
                      <SelectItem value="weekly">
                        {t("recurring.fe.frequencyWeekly")}
                      </SelectItem>
                      <SelectItem value="bi-weekly">
                        {t("recurring.fe.frequencyBiWeekly")}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t("recurring.fe.frequencyMonthly")}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {t("recurring.fe.frequencyQuarterly")}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {t("recurring.fe.frequencyYearly")}
                      </SelectItem>
                      <SelectItem value="random">
                        {t("recurring.fe.frequencyRandom")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(frequency === "weekly" || frequency === "bi-weekly") && (
              <FormField
                control={form.control}
                name="weekday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("recurring.fe.weekday")}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("recurring.fe.selectWeekday")}
                          >
                            {field.value !== undefined
                              ? weekdays.find(
                                  (day) => day.value === field.value!.toString()
                                )?.label
                              : null}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weekdays.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(frequency === "monthly" ||
              frequency === "quarterly" ||
              frequency === "yearly") && (
              <FormField
                control={form.control}
                name="dayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("recurring.fe.dayOfMonth")}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("common.fe.selectDate")}>
                            {field.value ? field.value.toString() : null}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("recurring.fe.dayOfMonthDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "random" && (
              <FormField
                control={form.control}
                name="randomEveryXDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("recurring.fe.randomEveryXDays")}</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder={t(
                          "recurring.fe.randomEveryXDaysPlaceholder"
                        )}
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
                  <FormLabel>{t("common.fe.startDate")}</FormLabel>
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
                          date <= new Date() ||
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
                  <FormLabel>{t("common.fe.endDate")} (Optional)</FormLabel>
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
                            <span>{t("common.fe.noEndDate")}</span>
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
                          date <= new Date() ||
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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.fe.status")}</FormLabel>
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
                      <SelectItem value="true">
                        {t("common.fe.active")}
                      </SelectItem>
                      <SelectItem value="false">
                        {t("common.fe.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                {recurring ? t("common.fe.update") : t("common.fe.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
