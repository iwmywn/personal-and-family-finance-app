"use server"

import { createTransactionSchema, type TransactionFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getTransactionsCollection } from "@/lib/collections"
import { type Transaction } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createTransaction(values: TransactionFormValues) {
  try {
    const [tCommonBE, tTransactionsBE, tSchemasTransaction] = await Promise.all(
      [
        getTranslations("common.be"),
        getTranslations("transactions.be"),
        getTranslations("schemas.transaction"),
      ]
    )
    const transactionSchema = createTransactionSchema(tSchemasTransaction)
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    const transactionsCollection = await getTransactionsCollection()

    const result = await transactionsCollection.insertOne({
      userId: new ObjectId(userId),
      type: values.type,
      categoryKey: values.categoryKey,
      amount: values.amount,
      description: values.description,
      date: values.date,
    })

    if (!result.acknowledged)
      return { error: tTransactionsBE("transactionAddFailed") }

    return { success: tTransactionsBE("transactionAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating transaction:", error)
    const tTransactionsBE = await getTranslations("transactions.be")
    return { error: tTransactionsBE("transactionAddFailed") }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
) {
  try {
    const [tCommonBE, tTransactionsBE, tSchemasTransaction] = await Promise.all(
      [
        getTranslations("common.be"),
        getTranslations("transactions.be"),
        getTranslations("schemas.transaction"),
      ]
    )
    const transactionSchema = createTransactionSchema(tSchemasTransaction)
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: tTransactionsBE("invalidTransactionId"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
    })

    if (!existingTransaction) {
      return {
        error: tTransactionsBE("transactionNotFoundOrNoPermission"),
      }
    }

    await transactionsCollection.updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          type: values.type,
          categoryKey: values.categoryKey,
          amount: values.amount,
          description: values.description,
          date: values.date,
        },
      }
    )

    return { success: tTransactionsBE("transactionUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating transaction:", error)
    const tTransactionsBE = await getTranslations("transactions.be")
    return { error: tTransactionsBE("transactionUpdateFailed") }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const [tCommonBE, tTransactionsBE] = await Promise.all([
      getTranslations("common.be"),
      getTranslations("transactions.be"),
    ])
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: tTransactionsBE("invalidTransactionId"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
    })

    if (!existingTransaction) {
      return {
        error: tTransactionsBE("transactionNotFoundOrNoPermissionDelete"),
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
    })

    return { success: tTransactionsBE("transactionDeleted") }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    const tTransactionsBE = await getTranslations("transactions.be")
    return { error: tTransactionsBE("transactionDeleteFailed") }
  }
}

export async function getTransactions() {
  try {
    const tCommonBE = await getTranslations("common.be")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1, _id: -1 })
      .toArray()

    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        _id: transaction._id.toString(),
        userId: transaction.userId.toString(),
      })) as Transaction[],
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    const tTransactionsBE = await getTranslations("transactions.be")
    return { error: tTransactionsBE("transactionFetchFailed") }
  }
}
