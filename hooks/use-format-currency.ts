"use client"

import { useUser } from "@/context/user-context"
import { CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"
import { formatCurrency } from "@/lib/utils"

export function useFormatCurrency() {
  const { user } = useUser()

  const userCurrency = user.currency as AppCurrency

  return (amount: string, overrideCurrency?: AppCurrency) => {
    const currency = overrideCurrency || userCurrency
    const currencyLocale = CURRENCY_CONFIG[currency].locale

    return formatCurrency(amount, currencyLocale, currency)
  }
}
