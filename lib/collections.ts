import type { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"
import { collection } from "@/lib/mongodb"

export function getUserCollection() {
  return collection<DBUser>("users")
}

export function getTransactionCollection() {
  return collection<DBTransaction>("transactions")
}

export function getCategoryCollection() {
  return collection<DBCustomCategory>("categories")
}
