import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import HomePage from "@/components/home/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const tNavigation = await getTranslations("navigation")

  return { title: tNavigation("home") }
}

export default function home() {
  return <HomePage />
}
