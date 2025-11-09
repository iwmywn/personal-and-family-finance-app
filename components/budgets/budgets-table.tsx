"use client"

import { useState } from "react"
import { MoreVertical, PiggyBank } from "lucide-react"
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
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAppData } from "@/lib/app-data-context"
import { calculateBudgetsStats } from "@/lib/budgets"
import type { Budget } from "@/lib/definitions"
import { formatCurrency } from "@/lib/utils"

interface BudgetsTableProps {
  filteredBudgets: Budget[]
  offsetHeight: number
}

export function BudgetsTable({
  filteredBudgets,
  offsetHeight,
}: BudgetsTableProps) {
  const { budgets, transactions, customCategories } = useAppData()
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const tBudgetsFE = useTranslations("budgets.fe")
  const tCommonFE = useTranslations("common.fe")
  const { getCategoryLabel, getCategoryDescription } = useCategoryI18n()
  const formatDate = useFormatDate()

  const budgetsWithSpent = calculateBudgetsStats(filteredBudgets, transactions)

  return (
    <>
      <Card>
        <CardContent>
          {budgetsWithSpent.length === 0 ? (
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
                  <PiggyBank />
                </EmptyMedia>
                <EmptyTitle>{tBudgetsFE("noBudgetsFound")}</EmptyTitle>
                <EmptyDescription>
                  {budgets!.length === 0
                    ? tBudgetsFE("noBudgetsDescription")
                    : tBudgetsFE("noBudgetsFiltered")}
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
                    <TableHead>{tBudgetsFE("startDate")}</TableHead>
                    <TableHead>{tBudgetsFE("endDate")}</TableHead>
                    <TableHead>{tBudgetsFE("category")}</TableHead>
                    <TableHead>{tCommonFE("amount")}</TableHead>
                    <TableHead>{tBudgetsFE("spent")}</TableHead>
                    <TableHead>{tBudgetsFE("balance")}</TableHead>
                    <TableHead>{tBudgetsFE("status")}</TableHead>
                    <TableHead>{tBudgetsFE("progress")}</TableHead>
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
                              {getCategoryLabel(
                                budget.categoryKey,
                                customCategories
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(
                              budget.categoryKey,
                              customCategories
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatCurrency(budget.amount)}</TableCell>
                      <TableCell>{formatCurrency(budget.spent)}</TableCell>
                      <TableCell>
                        {formatCurrency(budget.amount - budget.spent)}
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
                            ? tBudgetsFE("expired")
                            : budget.status === "active"
                              ? tBudgetsFE("active")
                              : tBudgetsFE("upcoming")}
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="dark:hover:bg-input/50"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreVertical />
                              <span className="sr-only">
                                {tBudgetsFE("openMenu")}
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
                              {tCommonFE("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedBudget(budget)
                                setIsDeleteOpen(true)
                              }}
                            >
                              {tCommonFE("delete")}
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
