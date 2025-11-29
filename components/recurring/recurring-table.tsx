"use client"

import { useState } from "react"
import { MoreVerticalIcon, RepeatIcon } from "lucide-react"
import { useExtracted } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeleteRecurringDialog } from "@/components/recurring/delete-recurring-dialog"
import { RecurringDialog } from "@/components/recurring/recurring-dialog"
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { RecurringTransaction } from "@/lib/definitions"
import { formatCurrency } from "@/lib/utils"
import { getNextDate } from "@/app/api/(cronjobs)/recurring-transactions/utils"

interface RecurringTableProps {
  filteredRecurring: RecurringTransaction[]
  offsetHeight: number
}

export function RecurringTable({
  filteredRecurring,
  offsetHeight,
}: RecurringTableProps) {
  const { recurringTransactions } = useAppData()
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")
  const [selectedRecurring, setSelectedRecurring] =
    useState<RecurringTransaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const t = useExtracted()
  const { getCategoryLabel, getCategoryDescription } = useCategory()
  const formatDate = useFormatDate()

  const getFrequencyLabel = (frequency: RecurringTransaction["frequency"]) => {
    switch (frequency) {
      case "daily":
        return t("Daily")
      case "weekly":
        return t("Weekly")
      case "bi-weekly":
        return t("Bi-Weekly")
      case "monthly":
        return t("Monthly")
      case "quarterly":
        return t("Quarterly")
      case "yearly":
        return t("Yearly")
      case "random":
        return t("Random")
      default:
        return frequency
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          {filteredRecurring.length === 0 ? (
            <Empty
              className="border"
              style={{
                minHeight: isLargeScreens
                  ? "300px"
                  : `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RepeatIcon />
                </EmptyMedia>
                <EmptyTitle>{t("No recurring transactions found")}</EmptyTitle>
                <EmptyDescription>
                  {recurringTransactions.length === 0
                    ? t("Start adding your recurring transactions.")
                    : t(
                        "No recurring transactions found matching your filters."
                      )}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div
              className="overflow-auto rounded-md border [&>div]:overflow-x-visible!"
              style={{
                maxHeight: isLargeScreens
                  ? "300px"
                  : `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow className="[&>th]:text-center">
                    <TableHead>{t("Start Date")}</TableHead>
                    <TableHead>{t("End Date")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead>{t("Type")}</TableHead>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead>{t("Amount")}</TableHead>
                    <TableHead>{t("Frequency")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecurring.map((recurring) => (
                    <TableRow
                      key={recurring._id}
                      className="[&>td]:text-center"
                    >
                      <TableCell>{formatDate(recurring.startDate)}</TableCell>
                      <TableCell>
                        {recurring.endDate
                          ? formatDate(recurring.endDate)
                          : t("No end date")}
                      </TableCell>
                      <TableCell>{recurring.description}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            recurring.type === "income"
                              ? "badge-green"
                              : "badge-red"
                          }
                        >
                          {recurring.type === "income"
                            ? t("Income")
                            : t("Expense")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              {getCategoryLabel(recurring.categoryKey)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(recurring.categoryKey)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatCurrency(recurring.amount)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{getFrequencyLabel(recurring.frequency)}</span>
                          {recurring.frequency === "random" ? (
                            <span className="text-muted-foreground text-xs">
                              {t("Every {days} days", {
                                days: recurring.randomEveryXDays!.toString(),
                              })}
                            </span>
                          ) : null}
                          {recurring.isActive ? (
                            <span className="text-muted-foreground text-xs">
                              {t("Next: {date}", {
                                date: formatDate(getNextDate(recurring)),
                              })}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            recurring.isActive ? "badge-green" : "badge-gray"
                          }
                        >
                          {recurring.isActive ? t("Active") : t("Inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="dark:hover:bg-input/50"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreVerticalIcon />
                              <span className="sr-only">{t("Open menu")}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedRecurring(recurring)
                                setIsEditOpen(true)
                              }}
                            >
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedRecurring(recurring)
                                setIsDeleteOpen(true)
                              }}
                            >
                              {t("Delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecurring && (
        <>
          <RecurringDialog
            key={selectedRecurring._id + "RecurringDialog"}
            recurring={selectedRecurring}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteRecurringDialog
            key={selectedRecurring._id + "DeleteRecurringDialog"}
            recurringId={selectedRecurring._id}
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
          />
        </>
      )}
    </>
  )
}
