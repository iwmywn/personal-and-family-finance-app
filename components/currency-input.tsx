"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { CURRENCY_CONFIG, type AppCurrency } from "@/lib/currency"
import { cn, isZeroDecimalCurrency } from "@/lib/utils"

type CurrencyInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  currency: AppCurrency
  value: string
  onChange: (value: string) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, currency, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const isZeroDecimal = isZeroDecimalCurrency(currency)

    const displayValue = React.useMemo(() => {
      if (isFocused || !value) return value

      const parsed = Number(value)
      if (Number.isNaN(parsed)) return ""

      return parsed.toLocaleString(CURRENCY_CONFIG[currency].locale, {
        minimumFractionDigits: isZeroDecimal ? 0 : 2,
        maximumFractionDigits: isZeroDecimal ? 0 : 2,
      })
    }, [isFocused, value, currency, isZeroDecimal])

    return (
      <Input
        ref={ref}
        id={id}
        type="text"
        placeholder="0"
        className={cn(className)}
        value={displayValue}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false)

          const separator = currency === "VND" ? /\./g : /,/g
          const cleanValue = e.target.value
            .replace(separator, "")
            .replace(",", ".")

          const parsed = parseFloat(cleanValue)
          if (!Number.isNaN(parsed)) {
            const decimals = isZeroDecimal ? 0 : 2
            const rounded = Number(parsed.toFixed(decimals))
            onChange(rounded.toString())
          } else {
            onChange("")
          }
        }}
        onChange={(e) => {
          const separator = currency === "VND" ? /\./g : /,/g
          const input = e.target.value.replace(separator, "").replace(",", ".")

          if (/^\d*\.?\d*$/.test(input)) {
            onChange(input)
          }
        }}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
