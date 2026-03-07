"use client"

import * as React from "react"

import type { RecurringTransaction } from "@/lib/definitions"

type RecurringContextValue = {
  recurringTransactions: RecurringTransaction[]
}

const RecurringContext = React.createContext<RecurringContextValue | null>(null)

export function RecurringProvider({
  children,
  recurringTransactions,
}: {
  children: React.ReactNode
  recurringTransactions: RecurringTransaction[]
}) {
  return (
    <RecurringContext.Provider
      value={{
        recurringTransactions,
      }}
    >
      {children}
    </RecurringContext.Provider>
  )
}

export function useRecurring() {
  const context = React.useContext(RecurringContext)
  if (!context) {
    throw new Error("useRecurring must be used within a RecurringProvider")
  }
  return context
}
