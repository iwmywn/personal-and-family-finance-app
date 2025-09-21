"use server"

import { ObjectId } from "mongodb"

import { getUserCollection } from "@/lib/collections"

export async function getUserById(id: string) {
  try {
    const user = await (
      await getUserCollection()
    ).findOne({ _id: new ObjectId(id) })
    return user
  } catch (error) {
    console.error("Failed to fetch user:", error)
  }
}

export async function getUserByUsername(username: string) {
  try {
    const user = await (await getUserCollection()).findOne({ username })
    return user
  } catch (error) {
    console.error("Failed to fetch user:", error)
  }
}
