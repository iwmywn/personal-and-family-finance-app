"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { updateLocale } from "@/actions/general"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppData } from "@/context/app-data-context"
import { LOCALE_CONFIG, type AppLocale } from "@/i18n/config"

export function LanguageSelector() {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { user } = useAppData()

  async function handleLocaleChange(locale: AppLocale) {
    startTransition(async () => {
      const result = await updateLocale(locale)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={user!.locale}
        onValueChange={handleLocaleChange}
        disabled={isPending}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("settings.fe.language")} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LOCALE_CONFIG).map(([locale, config]) => (
            <SelectItem key={locale} value={locale}>
              {config.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
