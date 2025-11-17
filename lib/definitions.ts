import type { ObjectId } from "mongodb"

import type { AppLocale } from "@/i18n/config"
import { type CategoryKeyType, type TransactionType } from "@/lib/categories"

type BaseUser<T> = {
  _id: T
  fullName: string
  username: string
  password: string
  locale: AppLocale
}

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

export type User = BaseUser<string>
export type DBUser = BaseUser<ObjectId>

export type Transaction = BaseTransaction<string>
export type DBTransaction = BaseTransaction<ObjectId>

export type Category = BaseCategory<string>
export type DBCategory = BaseCategory<ObjectId>

export type Budget = BaseBudget<string>
export type DBBudget = BaseBudget<ObjectId>

export type Goal = BaseGoal<string>
export type DBGoal = BaseGoal<ObjectId>
