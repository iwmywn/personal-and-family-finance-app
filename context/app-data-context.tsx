"use client"

import * as React from "react"

import type {
  Budget,
  Category,
  Goal,
  Transaction,
  User,
} from "@/lib/definitions"

type AppDataContextValue = {
  user: Omit<User, "password">
  transactions: Transaction[]
  customCategories: Category[]
  budgets: Budget[]
  goals: Goal[]
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

export function AppDataProvider({
  children,
  user,
  transactions,
  customCategories,
  budgets,
  goals,
}: {
  children: React.ReactNode
  user: Omit<User, "password">
  transactions: Transaction[]
  customCategories: Category[]
  budgets: Budget[]
  goals: Goal[]
}) {
  return (
    <AppDataContext.Provider
      value={{
        user,
        transactions,
        customCategories,
        budgets,
        goals,
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
