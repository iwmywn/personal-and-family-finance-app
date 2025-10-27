import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import HomePage from "@/components/home/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const tHome = await getTranslations("home")

  return { title: tHome("title") }
}

export default function home() {
  return <HomePage />
}
