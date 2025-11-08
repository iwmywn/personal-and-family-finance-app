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
import { BudgetDialog } from "@/components/budgets/budget-dialog"
import { DeleteBudgetDialog } from "@/components/budgets/delete-budget-dialog"
import { useCategoryI18n } from "@/hooks/use-category-i18n"
import { useFormatDate } from "@/hooks/use-format-date"
import { calculateBudgetsStats } from "@/lib/budgets"
import type { Budget } from "@/lib/definitions"
import { useBudgets, useTransactions } from "@/lib/swr"
import { formatCurrency } from "@/lib/utils"

interface BudgetsTableProps {
  filteredBudgets: Budget[]
  offsetHeight: number
}

export function BudgetsTable({
  filteredBudgets,
  offsetHeight,
}: BudgetsTableProps) {
  const { budgets } = useBudgets()
  const { transactions } = useTransactions()
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const tBudgetsFE = useTranslations("budgets.fe")
  const tCommonFE = useTranslations("common.fe")
  const { getCategoryLabel } = useCategoryI18n()
  const formatDate = useFormatDate()

  const budgetsWithSpent = calculateBudgetsStats(filteredBudgets, transactions!)

  return (
    <>
      <Card>
        <CardContent>
          {budgetsWithSpent.length === 0 ? (
            <Empty
              style={{
                minHeight: `calc(100vh - ${offsetHeight}px - 12.5rem)`,
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
                maxHeight: `calc(100vh - ${offsetHeight}px - 12.5rem)`,
              }}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow className="[&>th]:text-center">
                    <TableHead>{tBudgetsFE("startDate")}</TableHead>
                    <TableHead>{tBudgetsFE("endDate")}</TableHead>
                    <TableHead>{tBudgetsFE("category")}</TableHead>
                    <TableHead>{tBudgetsFE("amount")}</TableHead>
                    <TableHead>{tBudgetsFE("spent")}</TableHead>
                    <TableHead>{tBudgetsFE("remaining")}</TableHead>
                    <TableHead>{tBudgetsFE("status")}</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetsWithSpent.map((budget) => (
                    <TableRow key={budget._id} className="[&>td]:text-center">
                      <TableCell>{formatDate(budget.startDate)}</TableCell>
                      <TableCell>{formatDate(budget.endDate)}</TableCell>
                      <TableCell>
                        {getCategoryLabel(budget.categoryKey)}
                      </TableCell>
                      <TableCell>{formatCurrency(budget.amount)}</TableCell>
                      <TableCell>{formatCurrency(budget.spent)}</TableCell>
                      <TableCell>
                        {formatCurrency(budget.amount - budget.spent)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            budget.isActive ? "badge-income" : "badge-expense"
                          }
                        >
                          {budget.isActive
                            ? tBudgetsFE("active")
                            : tBudgetsFE("completed")}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-32">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(100, budget.percentage)}
                            className={`flex-1 ${budget.progressColorClass}`}
                          />
                          <div className="text-muted-foreground min-w-12">
                            {budget.percentage.toFixed(1)}%
                          </div>
                        </div>
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
