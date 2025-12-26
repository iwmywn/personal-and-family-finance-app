"use client"

import { useAppData } from "@/context/app-data-context"
import { CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"
import { formatCurrency } from "@/lib/utils"

export function useFormatCurrency() {
  const { user } = useAppData()

  const userCurrency = user.currency as AppCurrency
  const currencyLocale = CURRENCY_CONFIG[userCurrency].locale

  return (amount: string) => {
    return formatCurrency(amount, currencyLocale, userCurrency)
  }
}
