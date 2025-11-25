import type { Collection, OptionalId } from "mongodb"

import * as collectionsLib from "@/lib/collections"
import type {
  DBBudget,
  DBCategory,
  DBGoal,
  DBRecurringTransaction,
  DBTransaction,
} from "@/lib/definitions"

const mockTransactionCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
}

const mockCategoryCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

const mockBudgetCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

const mockGoalCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

const mockRecurringTransactionCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

export const setupTransactionCollectionMock = () => {
  vi.spyOn(collectionsLib, "getTransactionsCollection").mockResolvedValue(
    mockTransactionCollection as unknown as Collection<
      OptionalId<DBTransaction>
    >
  )
  return mockTransactionCollection
}

export const setupCategoryCollectionMock = () => {
  vi.spyOn(collectionsLib, "getCategoriesCollection").mockResolvedValue(
    mockCategoryCollection as unknown as Collection<OptionalId<DBCategory>>
  )
  return mockCategoryCollection
}

export const setupBudgetCollectionMock = () => {
  vi.spyOn(collectionsLib, "getBudgetsCollection").mockResolvedValue(
    mockBudgetCollection as unknown as Collection<OptionalId<DBBudget>>
  )
  return mockBudgetCollection
}

export const setupGoalCollectionMock = () => {
  vi.spyOn(collectionsLib, "getGoalsCollection").mockResolvedValue(
    mockGoalCollection as unknown as Collection<OptionalId<DBGoal>>
  )
  return mockGoalCollection
}

export const setupRecurringTransactionCollectionMock = () => {
  vi.spyOn(
    collectionsLib,
    "getRecurringTransactionsCollection"
  ).mockResolvedValue(
    mockRecurringTransactionCollection as unknown as Collection<
      OptionalId<DBRecurringTransaction>
    >
  )
  return mockRecurringTransactionCollection
}

export const mockTransactionCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getTransactionsCollection").mockRejectedValue(error)
}

export const mockCategoryCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getCategoriesCollection").mockRejectedValue(error)
}

export const mockBudgetCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getBudgetsCollection").mockRejectedValue(error)
}

export const mockGoalCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getGoalsCollection").mockRejectedValue(error)
}

export const mockRecurringTransactionCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(
    collectionsLib,
    "getRecurringTransactionsCollection"
  ).mockRejectedValue(error)
}
