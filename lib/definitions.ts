import type { Decimal128, ObjectId } from "mongodb"

import type { ExchangeRates, RawRates } from "@/actions/exchange-rates.actions"
import type { auth } from "@/lib/auth"
import type { CategoryKeyType, CategoryType } from "@/lib/categories"
import type { AppCurrency } from "@/lib/currency"

export type User = typeof auth.$Infer.Session.user
export type DBUser = { _id: ObjectId } & Omit<User, "id">

export type Session = typeof auth.$Infer.Session.session

type BaseTransaction<T, K> = {
  _id: T
  userId: T
  type: CategoryType
  categoryKey: CategoryKeyType
  // DB: the original amount and currency entered by the user.
  // Client: the amount converted to the user's global display currency setting.
  amount: K
  currency: AppCurrency
  description: string
  date: Date
  // the following fields are appended on the client for currency conversion
  // and are NOT stored in the database.
  // They allow budgets/goals to convert amounts to their specific currencies using historical daily rates.
  originalAmount?: K
  originalCurrency?: AppCurrency
  rates?: Record<AppCurrency, string>
}

type BaseCategory<T> = {
  _id: T
  userId: T
  categoryKey: string
  type: CategoryType
  label: string
  description: string
}

type BaseBudget<T, K> = {
  _id: T
  userId: T
  categoryKey: CategoryKeyType
  allocatedAmount: K
  currency: AppCurrency
  startDate: Date
  endDate: Date
}

type BaseGoal<T, K> = {
  _id: T
  userId: T
  categoryKey: CategoryKeyType
  name: string
  targetAmount: K
  currency: AppCurrency
  startDate: Date
  endDate: Date
}

type BaseRecurringTransaction<T, K> = {
  _id: T
  userId: T
  type: CategoryType
  categoryKey: CategoryKeyType
  amount: K
  currency: AppCurrency
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

type BaseExchangeRate<T, K> = {
  _id: T
  date: Date
  rates: K
}

export type Transaction = BaseTransaction<string, string>
export type DBTransaction = BaseTransaction<ObjectId, Decimal128>

export type Category = BaseCategory<string>
export type DBCategory = BaseCategory<ObjectId>

export type Budget = BaseBudget<string, string>
export type DBBudget = BaseBudget<ObjectId, Decimal128>

export type Goal = BaseGoal<string, string>
export type DBGoal = BaseGoal<ObjectId, Decimal128>

export type RecurringTransaction = BaseRecurringTransaction<string, string>
export type DBRecurringTransaction = BaseRecurringTransaction<
  ObjectId,
  Decimal128
>

export type ExchangeRate = BaseExchangeRate<string, ExchangeRates>
export type DBExchangeRate = BaseExchangeRate<ObjectId, RawRates>
