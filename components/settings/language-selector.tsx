"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
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
  const t = useTranslations("settings")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { user, mutate } = useUser()

  async function handleLocaleChange(locale: string) {
    startTransition(async () => {
      const result = await updateLocale(locale)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        localStorage.setItem("locale", locale)
        mutate({
          user: {
            ...user!,
            locale: locale,
          },
        })
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
          <SelectValue placeholder={t("language")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vi">Tiếng Việt</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
