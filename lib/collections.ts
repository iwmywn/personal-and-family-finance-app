import { collection } from "@/lib/db"
import type { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export function getUserCollection() {
  return collection<DBUser>("users")
}

export function getTransactionCollection() {
  return collection<DBTransaction>("transactions")
}

export function getCategoryCollection() {
  return collection<DBCustomCategory>("categories")
}
