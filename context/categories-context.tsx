"use client"

import * as React from "react"

import type { Category } from "@/lib/definitions"

type CategoriesContextValue = {
  customCategories: Category[]
}

const CategoriesContext = React.createContext<CategoriesContextValue | null>(
  null
)

export function CategoriesProvider({
  children,
  customCategories,
}: {
  children: React.ReactNode
  customCategories: Category[]
}) {
  return (
    <CategoriesContext.Provider
      value={{
        customCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = React.useContext(CategoriesContext)
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}
