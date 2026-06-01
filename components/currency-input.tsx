"use client"

import * as React from "react"
import type { CurrencyInputProps as ReactCurrencyInputProps } from "react-currency-input-field"
import ReactCurrencyInput from "react-currency-input-field"

import { Input } from "@/components/ui/input"
import { CURRENCY_CONFIG } from "@/lib/currency"
import type { AppCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

type CurrencyInputProps = ReactCurrencyInputProps & {
  currency: AppCurrency
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, currency, ...props }, ref) => {
    const config = CURRENCY_CONFIG[currency]

    return (
      <ReactCurrencyInput
        ref={ref}
        customInput={Input}
        className={cn(className)}
        placeholder="0"
        intlConfig={{ locale: config.locale, currency }}
        allowNegativeValue={false}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
