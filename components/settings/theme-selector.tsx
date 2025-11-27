"use client"

import { useTranslations } from "next-intl"
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
  const t = useTranslations()

  const themeLabels: Record<"light" | "dark" | "system", string> = {
    light: t("settings.fe.light"),
    dark: t("settings.fe.dark"),
    system: t("settings.fe.system"),
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger>
        <SelectValue placeholder={t("settings.fe.toggleTheme")} />
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
