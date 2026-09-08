"use client"

import * as React from "react"

import type { Session, User } from "@/lib/definitions"

type UserContextValue = {
  user: User
  session: Session
  activeSessions: Session[]
}

const UserContext = React.createContext<UserContextValue | null>(null)

export function UserProvider({
  children,
  user,
  session,
  activeSessions,
}: {
  children: React.ReactNode
  user: User
  session: Session
  activeSessions: Session[]
}) {
  return (
    <UserContext.Provider
      value={{
        user,
        session,
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
