import { ObjectId } from "mongodb"

import type {
  Budget,
  Category,
  DBBudget,
  DBCategory,
  DBGoal,
  DBRecurringTransaction,
  DBTransaction,
  DBUser,
  Goal,
  RecurringTransaction,
  Transaction,
} from "@/lib/definitions"
import { normalizeToUTCDate } from "@/lib/utils"

export const mockUser: DBUser = {
  _id: new ObjectId("68f712e4cda4897217a05a1c"),
  name: "Test User",
  email: "testuser@gmail.com",
  emailVerified: false,
  image: undefined,
  createdAt: new Date("2025-09-19T11:27:41.038Z"),
  updatedAt: new Date("2025-09-19T12:50:48.129Z"),
  username: "testuser",
  displayUsername: "testuser",
  locale: "en",
  twoFactorEnabled: false,
}

export const mockTransaction: DBTransaction = {
  _id: new ObjectId("68f73357357d93dcbaae8106"),
  userId: mockUser._id,
  type: "expense" as "income" | "expense",
  categoryKey: "food_beverage",
  amount: 50000,
  description: "hamburger",
  date: normalizeToUTCDate(new Date("2024-01-15")),
}

export const mockCustomCategory: DBCategory = {
  _id: new ObjectId("68f732914e63e5aa249cc173"),
  userId: mockUser._id,
  categoryKey: "custom_expense_abcdef12",
  type: "expense" as "income" | "expense",
  label: "Entertainment",
  description: "Movies and games",
}

export const mockBudget: DBBudget = {
  _id: new ObjectId("68f795d4bdcc3c9a30717988"),
  userId: mockUser._id,
  categoryKey: "food_beverage",
  allocatedAmount: 1000000,
  startDate: normalizeToUTCDate(new Date("2024-01-01")),
  endDate: normalizeToUTCDate(new Date("2024-01-31")),
}

export const mockGoal: DBGoal = {
  _id: new ObjectId("68f896e5cda4897217a05a2d"),
  userId: mockUser._id,
  categoryKey: "salary_bonus",
  name: "buy a motorbike",
  targetAmount: 50000000,
  startDate: normalizeToUTCDate(new Date("2024-01-01")),
  endDate: normalizeToUTCDate(new Date("2024-12-31")),
}

export const mockRecurringTransaction: DBRecurringTransaction = {
  _id: new ObjectId("68f896e5cda4897217a05a3e"),
  userId: mockUser._id,
  type: "income" as "income" | "expense",
  categoryKey: "salary_bonus",
  amount: 5000000,
  description: "Monthly Salary",
  frequency: "monthly",
  randomEveryXDays: undefined,
  startDate: normalizeToUTCDate(new Date("2024-01-01")),
  endDate: normalizeToUTCDate(new Date("2024-12-31")),
  lastGenerated: undefined,
  isActive: true,
}

export const mockValidTransactionValues = {
  type: "income" as "income" | "expense",
  categoryKey: "business_freelance",
  amount: 2500000,
  description: "freelance project payment",
  date: normalizeToUTCDate(new Date("2024-02-05")),
}

export const mockValidCategoryValues = {
  // categoryKey: auto generated
  type: "income" as "income" | "expense",
  label: "Salary",
  description: "Monthly job income",
}

export const mockValidBudgetValues = {
  categoryKey: "food_beverage",
  allocatedAmount: 1000000,
  startDate: normalizeToUTCDate(new Date("2024-01-01")),
  endDate: normalizeToUTCDate(new Date("2024-01-31")),
}

export const mockValidGoalValues = {
  categoryKey: "food_beverage",
  name: "buy a motorbike",
  targetAmount: 50000000,
  startDate: normalizeToUTCDate(new Date("2024-01-01")),
  endDate: normalizeToUTCDate(new Date("2024-12-31")),
}

export const mockValidRecurringTransactionValues = {
  type: "income" as "income" | "expense",
  categoryKey: "business_freelance",
  amount: 2500000,
  description: "Freelance project payment",
  frequency: "monthly" as const,
  randomEveryXDays: undefined,
  startDate: normalizeToUTCDate(new Date("2024-02-01")),
  endDate: normalizeToUTCDate(new Date("2024-12-31")),
  lastGenerated: undefined,
  isActive: true,
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
  {
    _id: "6",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense" as const,
    amount: 500000,
    description: "Food expense",
    categoryKey: "food_beverage",
    date: new Date("2024-02-15"),
  },
  {
    _id: "7",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense" as const,
    amount: 400000,
    description: "Transport expense",
    categoryKey: "transportation",
    date: new Date("2024-03-20"),
  },
  {
    _id: "8",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense" as const,
    amount: 2100000,
    description: "Housing expense",
    categoryKey: "housing",
    date: new Date("2024-04-10"),
  },
]

export const mockCustomCategories: Category[] = [
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

export const mockBudgets: Budget[] = [
  {
    _id: "1",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "food_beverage",
    allocatedAmount: 1000000,
    // related transactions: [6]
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-02-28"),
  },
  {
    _id: "2",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "transportation",
    allocatedAmount: 500000,
    // related transactions: [7]
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-28"),
  },
  {
    _id: "3",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "housing",
    allocatedAmount: 2000000,
    // related transactions: [8]
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-28"),
  },
  {
    _id: "4",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "food_beverage",
    allocatedAmount: 1500000,
    // related transactions: [7]
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-28"),
  },
  {
    _id: "5",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "business_freelance",
    allocatedAmount: 3000000,
    // related transactions: [1, 2, 3, 4, 5]
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-01-31"),
  },
]

export const mockGoals: Goal[] = [
  {
    _id: "1",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "salary_bonus",
    name: "buy a motorbike",
    targetAmount: 50000000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
  },
  {
    _id: "2",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "business_freelance",
    name: "buy a house",
    targetAmount: 2000000000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2025-12-31"),
  },
  {
    _id: "3",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "business_freelance",
    name: "freelance tax buffer",
    targetAmount: 600,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  },
  {
    _id: "4",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "business_freelance",
    name: "freelance emergency fund",
    targetAmount: 400,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
  },
  {
    _id: "5",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "investment_passive",
    name: "2023 dividend reinvestment",
    targetAmount: 1000000,
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-12-31"),
  },
  {
    _id: "6",
    userId: "68f712e4cda4897217a05a1c",
    categoryKey: "gift_support",
    name: "holiday gifts fund",
    targetAmount: 1500000,
    startDate: new Date("2024-11-01"),
    endDate: new Date("2025-01-31"),
  },
]

export const mockRecurringTransactions: RecurringTransaction[] = [
  {
    _id: "1",
    userId: "68f712e4cda4897217a05a1c",
    type: "income",
    categoryKey: "salary_bonus",
    amount: 5000000,
    description: "Monthly Salary",
    frequency: "monthly",
    randomEveryXDays: undefined,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    lastGenerated: undefined,
    isActive: true,
  },
  {
    _id: "2",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    categoryKey: "food_beverage",
    amount: 500000,
    description: "Weekly Groceries",
    frequency: "weekly",
    randomEveryXDays: undefined,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-06-30"),
    lastGenerated: undefined,
    isActive: true,
  },
  {
    _id: "3",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    categoryKey: "transportation",
    amount: 200000,
    description: "Monthly Transport Pass",
    frequency: "monthly",
    startDate: new Date("2024-02-01"),
    endDate: undefined,
    isActive: true,
  },
  {
    _id: "4",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    categoryKey: "housing",
    amount: 3000000,
    description: "Rent Payment",
    frequency: "monthly",
    randomEveryXDays: undefined,
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-31"),
    lastGenerated: undefined,
    isActive: false,
  },
  {
    _id: "5",
    userId: "68f712e4cda4897217a05a1c",
    type: "income",
    categoryKey: "business_freelance",
    amount: 2000000,
    description: "Freelance Project",
    frequency: "bi-weekly",
    randomEveryXDays: undefined,
    startDate: new Date("2023-12-01"),
    endDate: new Date("2023-12-31"),
    lastGenerated: undefined,
    isActive: false,
  },
  {
    _id: "6",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    categoryKey: "food_beverage",
    amount: 100000,
    description: "Daily Coffee",
    frequency: "daily",
    randomEveryXDays: undefined,
    startDate: new Date("2024-01-10"),
    endDate: new Date("2024-02-29"),
    lastGenerated: undefined,
    isActive: true,
  },
  {
    _id: "7",
    userId: "68f712e4cda4897217a05a1c",
    type: "expense",
    categoryKey: "transportation",
    amount: 50000,
    description: "Random Taxi Rides",
    frequency: "random",
    randomEveryXDays: 3,
    startDate: new Date("2024-04-01"),
    endDate: undefined,
    lastGenerated: undefined,
    isActive: true,
  },
]
