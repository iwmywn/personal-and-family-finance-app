import type { Collection, OptionalId } from "mongodb"

import * as collectionsLib from "@/lib/collections"
import type {
  DBBudget,
  DBCustomCategory,
  DBTransaction,
  DBUser,
} from "@/lib/definitions"

const mockUserCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

const mockCategoryCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

const mockTransactionCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
}

const mockBudgetCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

export const setupUserCollectionMock = () => {
  vi.spyOn(collectionsLib, "getUsersCollection").mockResolvedValue(
    mockUserCollection as unknown as Collection<OptionalId<DBUser>>
  )
  return mockUserCollection
}

export const setupCategoryCollectionMock = () => {
  vi.spyOn(collectionsLib, "getCategoriesCollection").mockResolvedValue(
    mockCategoryCollection as unknown as Collection<
      OptionalId<DBCustomCategory>
    >
  )
  return mockCategoryCollection
}

export const setupTransactionCollectionMock = () => {
  vi.spyOn(collectionsLib, "getTransactionsCollection").mockResolvedValue(
    mockTransactionCollection as unknown as Collection<
      OptionalId<DBTransaction>
    >
  )
  return mockTransactionCollection
}

export const mockUserCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getUsersCollection").mockRejectedValue(error)
}

export const mockCategoryCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getCategoriesCollection").mockRejectedValue(error)
}

export const mockTransactionCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getTransactionsCollection").mockRejectedValue(error)
}

export const setupBudgetCollectionMock = () => {
  vi.spyOn(collectionsLib, "getBudgetsCollection").mockResolvedValue(
    mockBudgetCollection as unknown as Collection<OptionalId<DBBudget>>
  )
  return mockBudgetCollection
}

export const mockBudgetCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getBudgetsCollection").mockRejectedValue(error)
}
