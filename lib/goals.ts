import type { Goal, Transaction } from "@/lib/definitions"
import { toDateOnly } from "@/lib/filters"
import { progressColorClass } from "@/lib/utils"

interface GoalWithStats extends Goal {
  accumulated: number
  percentage: number
  progressColorClass: string
  status: "expired" | "active" | "upcoming"
}

export function calculateGoalStats(
  goal: Goal,
  transactions: Transaction[]
): GoalWithStats {
  const startDateOnly = toDateOnly(new Date(goal.startDate))
  const endDateOnly = toDateOnly(new Date(goal.endDate))
  const nowDateOnly = toDateOnly(new Date())

  const goalTransactions = transactions.filter((t) => {
    if (t.type !== "income") return false

    const transactionDateOnly = toDateOnly(new Date(t.date))

    if (
      transactionDateOnly.getTime() < startDateOnly.getTime() ||
      transactionDateOnly.getTime() > endDateOnly.getTime()
    ) {
      return false
    }

    return t.categoryKey === goal.categoryKey
  })

  const accumulated = goalTransactions.reduce((sum, t) => sum + t.amount, 0)

  const percentage =
    goal.targetAmount === 0 ? 0 : (accumulated / goal.targetAmount) * 100

  let colorClass: string = progressColorClass.gray
  if (goalTransactions.length > 0) {
    if (percentage >= 100) {
      colorClass = progressColorClass.green
    } else if (percentage >= 75) {
      colorClass = progressColorClass.yellow
    } else {
      colorClass = progressColorClass.red
    }
  }

  let status: "expired" | "active" | "upcoming"
  if (endDateOnly.getTime() < nowDateOnly.getTime()) {
    status = "expired"
  } else if (
    startDateOnly.getTime() <= nowDateOnly.getTime() &&
    endDateOnly.getTime() >= nowDateOnly.getTime()
  ) {
    status = "active"
  } else {
    status = "upcoming"
  }

  return {
    ...goal,
    accumulated,
    percentage,
    progressColorClass: colorClass,
    status,
  }
}

export function calculateGoalsStats(
  goals: Goal[],
  transactions: Transaction[]
): GoalWithStats[] {
  return goals.map((goal) => calculateGoalStats(goal, transactions))
}
