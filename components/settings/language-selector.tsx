"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Locale } from "@/i18n/config"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { updateLocale } from "@/actions/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUser } from "@/lib/swr"

export function LanguageSelector() {
  const tSettings = useTranslations("settings")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { user, mutate } = useUser()

  async function handleLocaleChange(locale: Locale) {
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
        value={user!.locale!}
        onValueChange={handleLocaleChange}
        disabled={isPending}
      >
        <SelectTrigger>
          <SelectValue placeholder={tSettings("language")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vi">Tiếng Việt</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
