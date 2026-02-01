import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import HomePage from "@/components/home/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Home") }
}

export default function page() {
  return <HomePage />
}
