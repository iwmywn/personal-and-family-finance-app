import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import SettingsPage from "@/components/settings/settings-page"

export async function generateMetadata(): Promise<Metadata> {
  const tSettingsFE = await getTranslations("settings.fe")

  return {
    title: tSettingsFE("title"),
  }
}

export default function page() {
  return <SettingsPage />
}
