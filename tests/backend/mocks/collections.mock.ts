import type { Collection, OptionalId } from "mongodb"

import * as collectionsLib from "@/lib/collections"
import type { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export const mockUserCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

export const mockCategoryCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

export const mockTransactionCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
  deleteOne: vi.fn(),
}

export const setupUserCollectionMock = () => {
  vi.spyOn(collectionsLib, "getUserCollection").mockResolvedValue(
    mockUserCollection as unknown as Collection<OptionalId<DBUser>>
  )
  return mockUserCollection
}

export const setupCategoryCollectionMock = () => {
  vi.spyOn(collectionsLib, "getCategoryCollection").mockResolvedValue(
    mockCategoryCollection as unknown as Collection<
      OptionalId<DBCustomCategory>
    >
  )
  return mockCategoryCollection
}

export const setupTransactionCollectionMock = () => {
  vi.spyOn(collectionsLib, "getTransactionCollection").mockResolvedValue(
    mockTransactionCollection as unknown as Collection<
      OptionalId<DBTransaction>
    >
  )
  return mockTransactionCollection
}

export const mockUserCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getUserCollection").mockRejectedValue(error)
}

export const mockCategoryCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getCategoryCollection").mockRejectedValue(error)
}

export const mockTransactionCollectionError = (
  error: Error = new Error("Database error")
) => {
  vi.spyOn(collectionsLib, "getTransactionCollection").mockRejectedValue(error)
}
