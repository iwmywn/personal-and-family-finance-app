"use client"

import { buildSchemas } from "@/schemas"

import { useSchemaMessages } from "@/context/schema-messages-context"

export function useSchemas() {
  const messages = useSchemaMessages()

  return buildSchemas(messages)
}
