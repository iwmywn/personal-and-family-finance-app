"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppData } from "@/context/app-data-context"
import { LOCALE_CONFIG, type AppLocale } from "@/i18n/config"
import { setUserLocale } from "@/i18n/locale"
import { client } from "@/lib/auth-client"

export function LanguageSelector() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useAppData()

  async function handleLocaleChange(locale: AppLocale) {
    setIsLoading(true)

    await client.updateUser({
      locale,
      fetchOptions: {
        onError: () => {
          toast.error(t("settings.be.languageUpdateFailed"))
        },
        onSuccess: async () => {
          router.refresh()
          await setUserLocale(locale)
        },
      },
    })

    setIsLoading(false)
  }

  return (
    <Select
      value={user.locale}
      onValueChange={handleLocaleChange}
      disabled={isLoading}
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
  )
}
