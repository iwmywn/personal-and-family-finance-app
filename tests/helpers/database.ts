import { ObjectId } from "mongodb"

import {
  getCategoryCollection,
  getTransactionCollection,
  getUserCollection,
} from "@/lib/collections"
import { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export const insertTestUser = async (user: DBUser) => {
  const collection = await getUserCollection()
  const result = await collection.insertOne(user)
  return result.insertedId.toString()
}

export const insertTestTransaction = async (transaction: DBTransaction) => {
  const collection = await getTransactionCollection()
  const result = await collection.insertOne(transaction)
  return result.insertedId.toString()
}

export const insertTestCategory = async (category: DBCustomCategory) => {
  const collection = await getCategoryCollection()
  const result = await collection.insertOne(category)
  return result.insertedId.toString()
}

export const findUserById = async (userId: string) => {
  const collection = await getUserCollection()
  return collection.findOne({ _id: new ObjectId(userId) })
}

export const countTransactions = async (userId: string) => {
  const collection = await getTransactionCollection()
  return collection.countDocuments({ userId: new ObjectId(userId) })
}

export const countCategories = async (userId: string) => {
  const collection = await getCategoryCollection()
  return collection.countDocuments({ userId: new ObjectId(userId) })
}
