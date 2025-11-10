"use client"

import * as React from "react"

import type {
  Budget,
  CustomCategory,
  Transaction,
  User,
} from "@/lib/definitions"

type AppDataContextValue = {
  user: Omit<User, "password"> | null
  transactions: Transaction[]
  customCategories: CustomCategory[]
  budgets: Budget[]
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

export function AppDataProvider({
  children,
  user,
  transactions,
  customCategories,
  budgets,
}: {
  children: React.ReactNode
  user: Omit<User, "password"> | null
  transactions: Transaction[]
  customCategories: CustomCategory[]
  budgets: Budget[]
}) {
  return (
    <AppDataContext.Provider
      value={{
        user,
        transactions,
        customCategories,
        budgets,
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
