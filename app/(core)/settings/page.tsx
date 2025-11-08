import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import SettingsPage from "@/components/settings/settings-page"

export async function generateMetadata(): Promise<Metadata> {
  const tNavigation = await getTranslations("navigation")

  return {
    title: tNavigation("settings"),
  }
}

export default function page() {
  return <SettingsPage />
}
