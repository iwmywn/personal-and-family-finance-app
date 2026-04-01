"use client"

import * as React from "react"

import type { SchemaMessages } from "@/schemas/messages"

const SchemaMessagesContext = React.createContext<SchemaMessages | null>(null)

export function SchemaMessagesProvider({
  children,
  messages,
}: {
  children: React.ReactNode
  messages: SchemaMessages
}) {
  return (
    <SchemaMessagesContext.Provider value={messages}>
      {children}
    </SchemaMessagesContext.Provider>
  )
}

export function useSchemaMessages() {
  const context = React.useContext(SchemaMessagesContext)
  if (!context) {
    throw new Error(
      "useSchemaMessages must be used within a SchemaMessagesProvider"
    )
  }
  return context
}
