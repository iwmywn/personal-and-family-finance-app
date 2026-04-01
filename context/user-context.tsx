"use client"

import * as React from "react"

import type { Session, User } from "@/lib/definitions"

type UserContextValue = {
  user: User
  currentSession: Session
  activeSessions: Session[]
}

const UserContext = React.createContext<UserContextValue | null>(null)

export function UserProvider({
  children,
  user,
  currentSession,
  activeSessions,
}: {
  children: React.ReactNode
  user: User
  currentSession: Session
  activeSessions: Session[]
}) {
  return (
    <UserContext.Provider
      value={{
        user,
        currentSession,
        activeSessions,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = React.useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
