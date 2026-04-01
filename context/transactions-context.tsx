"use client"

import * as React from "react"

import type { Transaction } from "@/lib/definitions"

type TransactionsContextValue = {
  transactions: Transaction[]
}

const TransactionsContext =
  React.createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({
  children,
  transactions,
}: {
  children: React.ReactNode
  transactions: Transaction[]
}) {
  return (
    <TransactionsContext.Provider
      value={{
        transactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = React.useContext(TransactionsContext)
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    )
  }
  return context
}
