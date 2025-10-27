import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import HomePage from "@/components/home/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const tHomeFE = await getTranslations("home.fe")

  return { title: tHomeFE("title") }
}

export default function home() {
  return <HomePage />
}
