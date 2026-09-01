import * as collectionsLib from "@/lib/collections"

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
