"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { AppLocale, LOCALE_CONFIG } from "@/i18n/config"
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
import { useUser } from "@/lib/swr"

export function LanguageSelector() {
  const tSettingsFE = useTranslations("settings.fe")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { user, mutate } = useUser()

  async function handleLocaleChange(locale: AppLocale) {
    startTransition(async () => {
      const result = await updateLocale(locale)

      if (result.error) {
        toast.error(result.error)
      } else {
        mutate({
          user: {
            ...user!,
            locale: locale,
          },
        })
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
          <SelectValue placeholder={tSettingsFE("language")} />
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
