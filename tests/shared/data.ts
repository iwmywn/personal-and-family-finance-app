import { ObjectId } from "mongodb"

import type {
  CustomCategory,
  DBCustomCategory,
  DBTransaction,
  DBUser,
  Transaction,
} from "@/lib/definitions"

export const mockUser: DBUser = {
  _id: new ObjectId("68f712e4cda4897217a05a1c"),
  fullName: "Test User",
  username: "testuser",
  password: "$2a$10$uqIvouPdI5gzN95l3ct/zeOHzSICyxyRJJ7lCIqLbvUtKcqs4gRPe", //TestPassword123!
  locale: "en",
}

export const mockCustomCategory: DBCustomCategory = {
  _id: new ObjectId("68f732914e63e5aa249cc173"),
  userId: mockUser._id,
  categoryKey: "custom_expense_abcdef12",
  type: "expense" as "income" | "expense",
  label: "Entertainment",
  description: "Movies and games",
}

export const mockTransaction: DBTransaction = {
  _id: new ObjectId("68f73357357d93dcbaae8106"),
  userId: mockUser._id,
  type: "expense" as "income" | "expense",
  categoryKey: "food_beverage",
  amount: 50000,
  description: "nước dừa",
  date: new Date("2024-01-15"),
}

export const mockValidSignInValues = {
  username: "testuser",
  password: "TestPassword123!",
}

export const mockValidCategoryValues = {
  type: "income" as "income" | "expense",
  label: "Salary",
  description: "Monthly job income",
}

export const mockValidTransactionValues = {
  type: "income" as "income" | "expense",
  categoryKey: "business_freelance",
  amount: 2500000,
  description: "Dự án thiết kế web",
  date: new Date("2024-02-05"),
}

export const mockValidPasswordValues = {
  currentPassword: "TestPassword123!",
  newPassword: "NewPassword456!",
  confirmPassword: "NewPassword456!",
}

export const mockTransactions: Transaction[] = [
  {
    _id: "1",
    userId: "68f712e4cda4897217a05a1c",
    type: "income",
    amount: 1000,
    description: "Salary",
    categoryKey: "salary_bonus",
    date: new Date("2023-01-15"),
  },
  {
    _id: "2",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    amount: 200,
    description: "Groceries",
    categoryKey: "food_beverage",
    date: new Date("2024-01-16"),
  },
  {
    _id: "3",
    userId: "68f712e4cda4897217a05a1c",
    type: "income",
    amount: 500,
    description: "Freelance",
    categoryKey: "business_freelance",
    date: new Date("2024-01-20"),
  },
  {
    _id: "4",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    amount: 100,
    description: "Transport",
    categoryKey: "transportation",
    date: new Date("2024-01-22"),
  },
  {
    _id: "5",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    amount: 300,
    description: "Rent",
    categoryKey: "housing",
    date: new Date("2024-01-25"),
  },
]

export const mockCustomCategories: CustomCategory[] = [
  {
    _id: "1",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "custom_work",
    type: "income",
    label: "Freelance Work",
    description: "Custom freelance category",
  },
  {
    _id: "2",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "custom_food",
    type: "expense",
    label: "Restaurant",
    description: "Custom food category",
  },
  {
    _id: "3",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "custom_transport",
    type: "expense",
    label: "Taxi",
    description: "Custom transport category",
  },
]
