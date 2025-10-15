"use client"

import useSWRImmutable from "swr/immutable"

import { getUser } from "@/actions/auth"
import { getTransactions } from "@/actions/transactions"
import type { Transaction, User } from "@/lib/definitions"

export function useUser() {
  const { data, isLoading, mutate } = useSWRImmutable<
    | {
        error: string
        user?: undefined
      }
    | {
        user: User
        error?: undefined
      }
  >("me", getUser)

  const user = data?.user
  const userError = data?.error
  const isUserLoading = isLoading

  return {
    user,
    userError,
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
  const transactionsError = data?.error
  const isTransactionsLoading = isLoading

  return {
    transactions,
    transactionsError,
    isTransactionsLoading,
    mutate,
  }
}
