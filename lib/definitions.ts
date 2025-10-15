import type { ObjectId } from "mongodb"

import { ALL_CATEGORIES, TRANSACTION_TYPES } from "@/lib/categories"

type BaseUser<T> = {
  _id: T
  fullName: string
  username: string
  password: string
}

type BaseTransaction<T> = {
  _id: T
  userId: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  date: Date
}

export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type TransactionCategory = (typeof ALL_CATEGORIES)[number]

export type User = BaseUser<string>
export type DBUser = BaseUser<ObjectId>

export type Transaction = BaseTransaction<string>
export type DBTransaction = BaseTransaction<ObjectId>
