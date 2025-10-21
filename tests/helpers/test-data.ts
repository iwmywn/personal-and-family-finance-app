import { ObjectId } from "mongodb"

export const user = {
  _id: new ObjectId("68f712e4cda4897217a05a1c"),
  fullName: "Test User",
  username: "testuser",
  password: "$2a$10$uqIvouPdI5gzN95l3ct/zeOHzSICyxyRJJ7lCIqLbvUtKcqs4gRPe", //TestPassword123!
}

export const category = {
  _id: new ObjectId("68f732914e63e5aa249cc173"),
  userId: user._id,
  categoryKey: "custom_expense_abcdef12",
  type: "expense" as "income" | "expense",
  label: "Entertainment",
  description: "Movies and games",
}

export const transaction = {
  _id: new ObjectId("68f73357357d93dcbaae8106"),
  userId: user._id,
  type: "expense" as "income" | "expense",
  categoryKey: "food_beverage",
  amount: 50000,
  description: "nước dừa",
  date: new Date("2024-01-15"),
}

export const validSignInValues = {
  username: "testuser",
  password: "TestPassword123!",
}

export const validCategoryValues = {
  type: "expense" as "income" | "expense",
  label: "Entertainment",
  description: "Movies and games",
}

export const validTransactionValues = {
  type: "expense" as "income" | "expense",
  categoryKey: "food_beverage",
  amount: 50000,
  description: "nước dừa",
  date: new Date("2024-01-15"),
}

export const validPasswordValues = {
  currentPassword: "TestPassword123!",
  newPassword: "NewPassword456!",
  confirmPassword: "NewPassword456!",
}
