"use client"

import { useState } from "react"
import { MoreVerticalIcon, TargetIcon } from "lucide-react"
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
import { DeleteGoalDialog } from "@/components/goals/delete-goal-dialog"
import { GoalDialog } from "@/components/goals/goal-dialog"
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Goal } from "@/lib/definitions"
import { calculateGoalsStats } from "@/lib/statistics"
import { formatCurrency } from "@/lib/utils"

interface GoalsTableProps {
  filteredGoals: Goal[]
  offsetHeight: number
}

export function GoalsTable({ filteredGoals, offsetHeight }: GoalsTableProps) {
  const { goals, transactions } = useAppData()
  const isLargeScreens = useMediaQuery("(max-width: 1023px)")
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const t = useExtracted()
  const { getCategoryLabel, getCategoryDescription } = useCategory()
  const formatDate = useFormatDate()

  const goalsWithStats = calculateGoalsStats(filteredGoals, transactions)

  return (
    <>
      <Card>
        <CardContent>
          {filteredGoals.length === 0 ? (
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
                  <TargetIcon />
                </EmptyMedia>
                <EmptyTitle>{t("No goals found")}</EmptyTitle>
                <EmptyDescription>
                  {goals.length === 0
                    ? t("Start setting your financial goals.")
                    : t("No goals found matching your filters.")}
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
                    <TableHead>{t("Goal Name")}</TableHead>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead>{t("Target Amount")}</TableHead>
                    <TableHead>{t("Accumulated")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("Progress")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalsWithStats.map((goal) => (
                    <TableRow key={goal._id} className="[&>td]:text-center">
                      <TableCell>{formatDate(goal.startDate)}</TableCell>
                      <TableCell>{formatDate(goal.endDate)}</TableCell>
                      <TableCell className="font-medium">{goal.name}</TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              {getCategoryLabel(goal.categoryKey)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getCategoryDescription(goal.categoryKey)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatCurrency(goal.targetAmount)}</TableCell>
                      <TableCell>{formatCurrency(goal.accumulated)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            goal.status === "expired"
                              ? "badge-red"
                              : goal.status === "active"
                                ? "badge-green"
                                : "badge-yellow"
                          }
                        >
                          {goal.status === "expired"
                            ? t("Expired")
                            : goal.status === "active"
                              ? t("Active")
                              : t("Upcoming")}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-32">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Progress
                              value={Math.min(100, goal.percentage)}
                              className={`flex-1 ${goal.progressColorClass}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {goal.percentage.toFixed(1)}%
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
                              <span className="sr-only">{t("Open menu")}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedGoal(goal)
                                setIsEditOpen(true)
                              }}
                            >
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              variant="destructive"
                              onClick={() => {
                                setSelectedGoal(goal)
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

      {selectedGoal && (
        <>
          <GoalDialog
            key={selectedGoal._id + "GoalDialog"}
            goal={selectedGoal}
            open={isEditOpen}
            setOpen={setIsEditOpen}
          />
          <DeleteGoalDialog
            key={selectedGoal._id + "DeleteGoalDialog"}
            goalId={selectedGoal._id}
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
          />
        </>
      )}
    </>
  )
}
