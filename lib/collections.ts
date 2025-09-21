import type { DBUser } from "@/lib/definitions"
import { collection } from "@/lib/mongodb"

export async function getUserCollection() {
  return await collection<DBUser>("users")
}
