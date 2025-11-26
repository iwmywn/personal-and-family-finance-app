"use client"

import * as React from "react"

import type {
  Budget,
  Category,
  Goal,
  RecurringTransaction,
  Session,
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
  currentSession: Session
  activeSessions: Session["session"][]
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
  currentSession,
  activeSessions,
}: {
  children: React.ReactNode
  user: User
  transactions: Transaction[]
  customCategories: Category[]
  budgets: Budget[]
  goals: Goal[]
  recurringTransactions: RecurringTransaction[]
  currentSession: Session
  activeSessions: Session["session"][]
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
        currentSession,
        activeSessions,
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
