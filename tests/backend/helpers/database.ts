import {
  getCategoriesCollection,
  getTransactionsCollection,
  getUsersCollection,
} from "@/lib/collections"
import { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export const insertTestUser = async (user: DBUser) => {
  const collection = await getUsersCollection()
  await collection.insertOne(user)
}

export const insertTestTransaction = async (transaction: DBTransaction) => {
  const collection = await getTransactionsCollection()
  await collection.insertOne(transaction)
}

export const insertTestCategory = async (category: DBCustomCategory) => {
  const collection = await getCategoriesCollection()
  await collection.insertOne(category)
}
