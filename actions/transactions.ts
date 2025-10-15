"use server"

import { transactionSchema, type TransactionFormValues } from "@/schemas"
import { ObjectId } from "mongodb"

import { getTransactionCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function createTransaction(values: TransactionFormValues) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return { error: "Unauthorized! Please reload the page and try again." }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Invalid data provided!" }
    }

    const transactionsCollection = await getTransactionCollection()

    const result = await transactionsCollection.insertOne({
      userId,
      type: values.type,
      category: values.category,
      amount: values.amount,
      description: values.description,
      date: values.date,
    })

    if (!result.acknowledged)
      return { error: "Transaction creation failed! Try again later." }

    return { success: "Transaction saved.", error: undefined }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { error: "Failed to create transaction. Please try again." }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return { error: "Unauthorized! Please reload the page and try again." }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Invalid data provided!" }
    }

    const transactionsCollection = await getTransactionCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      userId,
    })

    if (!existingTransaction) {
      return {
        error: "Transaction not found or you don't have permission to edit it!",
      }
    }

    await transactionsCollection.updateOne(
      { _id: new ObjectId(transactionId), userId },
      {
        $set: {
          type: values.type,
          category: values.category,
          amount: values.amount,
          description: values.description,
          date: values.date,
          updatedAt: new Date(),
        },
      }
    )

    return { success: "Transaction saved.", error: undefined }
  } catch (error) {
    console.error("Error updating transaction:", error)
    return { error: "Failed to update transaction! Please try again later." }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return { error: "Unauthorized! Please reload the page and try again." }
    }

    const transactionsCollection = await getTransactionCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      userId,
    })

    if (!existingTransaction) {
      return {
        error:
          "Transaction not found or you don't have permission to delete it!",
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
      userId,
    })

    return { success: "Transaction deleted." }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: "Failed to delete transaction! Please try again later." }
  }
}

export async function getTransactions() {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return { error: "Unauthorized! Please reload the page and try again." }
    }

    const transactionsCollection = await getTransactionCollection()

    const transactions = await transactionsCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray()

    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        _id: transaction._id.toString(),
        userId: transaction.userId.toString(),
      })),
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { error: "Failed to fetch transactions! Please try again later." }
  }
}
