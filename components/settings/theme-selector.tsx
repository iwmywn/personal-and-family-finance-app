"use client"

import { useExtracted } from "next-intl"
import { useTheme } from "next-themes"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const t = useExtracted()

  const themeLabels: Record<"light" | "dark" | "system", string> = {
    light: t("Light"),
    dark: t("Dark"),
    system: t("System"),
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger>
        <SelectValue placeholder={t("Toggle theme")} />
      </SelectTrigger>
      <SelectContent>
        {(["light", "dark", "system"] as const).map((value) => (
          <SelectItem key={value} value={value}>
            {themeLabels[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
