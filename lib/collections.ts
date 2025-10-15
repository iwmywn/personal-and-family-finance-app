import type { DBTransaction, DBUser } from "@/lib/definitions"
import { collection } from "@/lib/mongodb"

export async function getUserCollection() {
  return await collection<DBUser>("users")
}

export async function getTransactionCollection() {
  return await collection<DBTransaction>("transactions")
}
