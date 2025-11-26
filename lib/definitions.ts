import { type ObjectId } from "mongodb"

import type { auth } from "@/lib/auth"
import { type CategoryKeyType, type TransactionType } from "@/lib/categories"

export type User = typeof auth.$Infer.Session.user
export type DBUser = { _id: ObjectId } & Omit<User, "id">

export type Session = typeof auth.$Infer.Session

type BaseTransaction<T> = {
  _id: T
  userId: T
  type: TransactionType
  categoryKey: CategoryKeyType
  amount: number
  description: string
  date: Date
}

type BaseCategory<T> = {
  _id: T
  userId: T
  categoryKey: string
  type: TransactionType
  label: string
  description: string
}

type BaseBudget<T> = {
  _id: T
  userId: T
  categoryKey: CategoryKeyType
  allocatedAmount: number
  startDate: Date
  endDate: Date
}

type BaseGoal<T> = {
  _id: T
  userId: T
  categoryKey: CategoryKeyType
  name: string
  targetAmount: number
  startDate: Date
  endDate: Date
}

type BaseRecurringTransaction<T> = {
  _id: T
  userId: T
  type: TransactionType
  categoryKey: CategoryKeyType
  amount: number
  description: string
  frequency:
    | "daily"
    | "weekly"
    | "bi-weekly"
    | "monthly"
    | "quarterly"
    | "yearly"
    | "random"
  randomEveryXDays?: number
  startDate: Date
  endDate?: Date
  lastGenerated?: Date
  isActive: boolean
}

export type Transaction = BaseTransaction<string>
export type DBTransaction = BaseTransaction<ObjectId>

export type Category = BaseCategory<string>
export type DBCategory = BaseCategory<ObjectId>

export type Budget = BaseBudget<string>
export type DBBudget = BaseBudget<ObjectId>

export type Goal = BaseGoal<string>
export type DBGoal = BaseGoal<ObjectId>

export type RecurringTransaction = BaseRecurringTransaction<string>
export type DBRecurringTransaction = BaseRecurringTransaction<ObjectId>
