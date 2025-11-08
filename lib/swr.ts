"use client"

import { mutate } from "swr"
import useSWRImmutable from "swr/immutable"

import { getUser } from "@/actions/auth"
import { getBudgets } from "@/actions/budgets"
import { getCustomCategories } from "@/actions/categories"
import { getTransactions } from "@/actions/transactions"
import type {
  Budget,
  CustomCategory,
  Transaction,
  User,
} from "@/lib/definitions"

export function clearSWRCache() {
  mutate(() => true, undefined, { revalidate: false })
}

export function useUser() {
  const { data, isLoading, mutate } = useSWRImmutable<
    | {
        error: string
        user?: undefined
      }
    | {
        user: Omit<User, "password">
        error?: undefined
      }
  >("user", getUser)

  const user = data?.user
  // const userError = data?.error
  const isUserLoading = isLoading

  return {
    user,
    // userError,
    isUserLoading,
    mutate,
  }
}

export function useTransactions() {
  const { data, isLoading, mutate } = useSWRImmutable<
    | { error: string; transactions?: undefined }
    | {
        transactions: Transaction[]
        error?: undefined
      }
  >("transactions", getTransactions)

  const transactions = data?.transactions
  // const transactionsError = data?.error
  const isTransactionsLoading = isLoading

  return {
    transactions,
    // transactionsError,
    isTransactionsLoading,
    mutate,
  }
}

export function useCustomCategories() {
  const { data, isLoading, mutate } = useSWRImmutable<
    | { error: string; customCategories?: undefined }
    | {
        customCategories: CustomCategory[]
        error?: undefined
      }
  >("custom-categories", getCustomCategories)

  const customCategories = data?.customCategories
  // const categoriesError = data?.error
  const isCategoriesLoading = isLoading

  return {
    customCategories,
    // categoriesError,
    isCategoriesLoading,
    mutate,
  }
}

export function useBudgets() {
  const { data, isLoading, mutate } = useSWRImmutable<
    | { error: string; budgets?: undefined }
    | {
        budgets: Budget[]
        error?: undefined
      }
  >("budgets", getBudgets)

  const budgets = data?.budgets
  // const budgetsError = data?.error
  const isBudgetsLoading = isLoading

  return {
    budgets,
    // budgetsError,
    isBudgetsLoading,
    mutate,
  }
}
