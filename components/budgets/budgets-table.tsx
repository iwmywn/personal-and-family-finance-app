"use client"

import { useState } from "react"
import { MoreVerticalIcon, PiggyBankIcon } from "lucide-react"
import { useTranslations } from "next-intl"

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
import { Progress } from "@/components/ui/progress"
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
import { BudgetDialog } from "@/components/budgets/budget-dialog"
import { DeleteBudgetDialog } from "@/components/budgets/delete-budget-dialog"
import { useAppData } from "@/context/app-data-context"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Budget } from "@/lib/definitions"
import { calculateBudgetsStats } from "@/lib/statistics"
import { formatCurrency } from "@/lib/utils"

interface BudgetsTableProps {
  filteredBudgets: Budget[]
  offsetHeight: number
}

export function BudgetsTable({
  filteredBudgets,
  offsetHeight,
}: BudgetsTableProps) {
  const { budgets, transactions } = useAppData()
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const t = useTranslations()
  const { getCategoryLabel, getCategoryDescription } = useCategoryI18n()
  const formatDate = useFormatDate()

  const budgetsWithSpent = calculateBudgetsStats(filteredBudgets, transactions)

  return (
    <>
      <Card>
        <CardContent>
          {filteredBudgets.length === 0 ? (
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
                  <PiggyBankIcon />
                </EmptyMedia>
                <EmptyTitle>{t("budgets.fe.noBudgetsFound")}</EmptyTitle>
                <EmptyDescription>
                  {budgets.length === 0
                    ? t("budgets.fe.noBudgetsDescription")
                    : t("budgets.fe.noBudgetsFiltered")}
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
                    <TableHead>{t("common.fe.startDate")}</TableHead>
                    <TableHead>{t("common.fe.endDate")}</TableHead>
                    <TableHead>{t("common.fe.category")}</TableHead>
                    <TableHead>{t("common.fe.amount")}</TableHead>
                    <TableHead>{t("budgets.fe.spent")}</TableHead>
                    <TableHead>{t("common.fe.balance")}</TableHead>
                    <TableHead>{t("common.fe.status")}</TableHead>
                    <TableHead>{t("common.fe.progress")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetsWithSpent.map((budget) => (
                    <TableRow key={budget._id} className="[&>td]:text-center">
                      <TableCell>{formatDate(budget.startDate)}</TableCell>
                      <TableCell>{formatDate(budget.endDate)}</TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              {getCategoryLabel(budget.categoryKey)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(budget.categoryKey)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(budget.allocatedAmount)}
                      </TableCell>
                      <TableCell>{formatCurrency(budget.spent)}</TableCell>
                      <TableCell>
                        {formatCurrency(budget.allocatedAmount - budget.spent)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            budget.status === "expired"
                              ? "badge-red"
                              : budget.status === "active"
                                ? "badge-green"
                                : "badge-yellow"
                          }
                        >
                          {budget.status === "expired"
                            ? t("common.fe.expired")
                            : budget.status === "active"
                              ? t("common.fe.active")
                              : t("common.fe.upcoming")}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-32">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Progress
                              value={Math.min(100, budget.percentage)}
                              className={`flex-1 ${budget.progressColorClass}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {budget.percentage.toFixed(1)}%
                          </TooltipContent>
                        </Tooltip>
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
                              <span className="sr-only">
                                {t("common.fe.openMenu")}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedBudget(budget)
                                setIsEditOpen(true)
                              }}
                            >
                              {t("common.fe.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBudget(budget)
                                setIsDeleteOpen(true)
                              }}
                            >
                              {t("common.fe.delete")}
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

      {selectedBudget && (
        <>
          <BudgetDialog
            key={selectedBudget._id + "BudgetDialog"}
            budget={selectedBudget}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteBudgetDialog
            key={selectedBudget._id + "DeleteBudgetDialog"}
            budgetId={selectedBudget._id}
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
          />
        </>
      )}
    </>
  )
}
