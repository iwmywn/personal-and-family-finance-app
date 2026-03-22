"use server"

import { buildSchemas } from "@/schemas/index"
import { getSchemaMessages } from "@/schemas/messages"

export async function getSchemas() {
  const messages = await getSchemaMessages()

  return buildSchemas(messages)
}
