"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppData } from "@/context/app-data-context"
import { client } from "@/lib/auth-client"
import { CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"

export function CurrencySelector() {
  const t = useExtracted()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useAppData()

  async function handleCurrencyChange(currency: AppCurrency) {
    setIsLoading(true)

    await client.updateUser({
      currency,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to update currency! Please try again later."))
        },
        onSuccess: async () => {
          window.location.reload()
        },
      },
    })

    setIsLoading(false)
  }

  return (
    <Select
      value={user.currency}
      onValueChange={handleCurrencyChange}
      disabled={isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={t("Currency")} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCY_CONFIG).map(([currency, config]) => (
          <SelectItem key={currency} value={currency}>
            {config.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
