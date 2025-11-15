import type { Goal, Transaction } from "@/lib/definitions"

interface GoalWithStats extends Goal {
  percentage: number
  progressColorClass: string
  remainingAmount: number
  status: "completed" | "active" | "overdue"
}

export const progressColorClass = {
  gray: "[&>[data-slot=progress-indicator]]:bg-gray-600",
  green: "[&>[data-slot=progress-indicator]]:bg-green-600",
  yellow: "[&>[data-slot=progress-indicator]]:bg-yellow-600",
  red: "[&>[data-slot=progress-indicator]]:bg-red-600",
} as const

export function calculateGoalStats(goal: Goal): GoalWithStats {
  const now = new Date()
  const deadline = new Date(goal.deadline)

  const percentage =
    goal.targetAmount === 0
      ? 0
      : Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)

  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount)

  let colorClass: string = progressColorClass.gray
  if (goal.currentAmount > 0) {
    if (percentage >= 100) {
      colorClass = progressColorClass.green
    } else if (percentage >= 75) {
      colorClass = progressColorClass.green
    } else if (percentage >= 50) {
      colorClass = progressColorClass.yellow
    } else {
      colorClass = progressColorClass.red
    }
  }

  let status: "completed" | "active" | "overdue"
  if (goal.isCompleted || percentage >= 100) {
    status = "completed"
  } else if (deadline < now) {
    status = "overdue"
  } else {
    status = "active"
  }

  return {
    ...goal,
    percentage,
    progressColorClass: colorClass,
    remainingAmount,
    status,
  }
}

export function calculateGoalsStats(goals: Goal[]): GoalWithStats[] {
  return goals.map((goal) => calculateGoalStats(goal))
}

export function calculateGoalProgressFromTransactions(
  goal: Goal,
  transactions: Transaction[]
): number {
  const goalTransactions = transactions.filter((t) => {
    if (t.type !== "income") return false
    if (t.categoryKey !== goal.categoryKey) return false
    return true
  })

  const totalFromTransactions = goalTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  )

  return goal.currentAmount + totalFromTransactions
}
