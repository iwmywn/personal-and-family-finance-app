"use client"

import * as React from "react"

import type {
  Budget,
  Category,
  Goal,
  RecurringTransaction,
  Transaction,
  User,
} from "@/lib/definitions"

type AppDataContextValue = {
  user: User
  transactions: Transaction[]
  customCategories: Category[]
  budgets: Budget[]
  goals: Goal[]
  recurringTransactions: RecurringTransaction[]
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

export function AppDataProvider({
  children,
  user,
  transactions,
  customCategories,
  budgets,
  goals,
  recurringTransactions,
}: {
  children: React.ReactNode
  user: User
  transactions: Transaction[]
  customCategories: Category[]
  budgets: Budget[]
  goals: Goal[]
  recurringTransactions: RecurringTransaction[]
}) {
  return (
    <AppDataContext.Provider
      value={{
        user,
        transactions,
        customCategories,
        budgets,
        goals,
        recurringTransactions,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = React.useContext(AppDataContext)
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }
  return context
}
