import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

import { DBCustomCategory, DBTransaction, DBUser } from "@/lib/definitions"

export const testUserId = new ObjectId().toString()
export const testUserId2 = new ObjectId().toString()

export const createTestUser = async (
  username = "testuser"
): Promise<DBUser> => {
  const hashedPassword = await bcrypt.hash("TestPassword123!", 10)
  return {
    _id: new ObjectId(),
    fullName: "Hoàng Anh Test",
    username,
    password: hashedPassword,
  }
}

export const createTestTransaction = (
  userId: string = testUserId
): DBTransaction => {
  return {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    type: "expense",
    categoryKey: "food_beverage",
    amount: 50000,
    description: "nước dừa",
    date: new Date("2024-01-15"),
  }
}

export const createTestCategory = (
  userId: string = testUserId
): DBCustomCategory => {
  return {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    categoryKey: "custom_expense_abc123",
    type: "expense",
    label: "Entertainment",
    description: "Movies and games",
  }
}

export const validSignInValues = {
  username: "testuser",
  password: "TestPassword123!",
}

export const validTransactionValues = {
  type: "expense" as "income" | "expense",
  categoryKey: "food_beverage",
  amount: 50000,
  description: "nước dừa",
  date: new Date("2024-01-15"),
}

export const validCategoryValues = {
  type: "expense" as "income" | "expense",
  label: "Entertainment",
  description: "Movies and games",
}

export const validPasswordValues = {
  currentPassword: "TestPassword123!",
  newPassword: "NewPassword456!",
}
