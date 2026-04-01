"use client"

import * as React from "react"

import type { Budget } from "@/lib/definitions"

type BudgetsContextValue = {
  budgets: Budget[]
}

const BudgetsContext = React.createContext<BudgetsContextValue | null>(null)

export function BudgetsProvider({
  children,
  budgets,
}: {
  children: React.ReactNode
  budgets: Budget[]
}) {
  return (
    <BudgetsContext.Provider
      value={{
        budgets,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  )
}

export function useBudgets() {
  const context = React.useContext(BudgetsContext)
  if (!context) {
    throw new Error("useBudgets must be used within a BudgetsProvider")
  }
  return context
}
