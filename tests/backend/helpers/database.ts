import {
  getBudgetsCollection,
  getCategoriesCollection,
  getTransactionsCollection,
  getUsersCollection,
} from "@/lib/collections"
import {
  type DBBudget,
  type DBCustomCategory,
  type DBTransaction,
  type DBUser,
} from "@/lib/definitions"

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

export const insertTestBudget = async (budget: DBBudget) => {
  const collection = await getBudgetsCollection()
  await collection.insertOne(budget)
}
