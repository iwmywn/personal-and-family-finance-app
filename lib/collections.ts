import { collection } from "@/lib/db"
import type { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export function getUsersCollection() {
  return collection<DBUser>("users")
}

export function getTransactionsCollection() {
  return collection<DBTransaction>("transactions")
}

export function getCategoriesCollection() {
  return collection<DBCustomCategory>("categories")
}
