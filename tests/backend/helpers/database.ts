import {
  getCategoryCollection,
  getTransactionCollection,
  getUserCollection,
} from "@/lib/collections"
import { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export const insertTestUser = async (user: DBUser) => {
  const collection = await getUserCollection()
  await collection.insertOne(user)
}

export const insertTestTransaction = async (transaction: DBTransaction) => {
  const collection = await getTransactionCollection()
  await collection.insertOne(transaction)
}

export const insertTestCategory = async (category: DBCustomCategory) => {
  const collection = await getCategoryCollection()
  await collection.insertOne(category)
}
