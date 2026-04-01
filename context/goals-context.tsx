"use client"

import * as React from "react"

import type { Goal } from "@/lib/definitions"

type GoalsContextValue = {
  goals: Goal[]
}

const GoalsContext = React.createContext<GoalsContextValue | null>(null)

export function GoalsProvider({
  children,
  goals,
}: {
  children: React.ReactNode
  goals: Goal[]
}) {
  return (
    <GoalsContext.Provider
      value={{
        goals,
      }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  const context = React.useContext(GoalsContext)
  if (!context) {
    throw new Error("useGoals must be used within a GoalsProvider")
  }
  return context
}
