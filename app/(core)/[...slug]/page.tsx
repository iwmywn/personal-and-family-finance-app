import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import NotFound from "@/app/not-found"

export async function generateMetadata(): Promise<Metadata> {
  const tCommonFE = await getTranslations("common.fe")

  return {
    title: tCommonFE("notFound"),
  }
}

export default function page() {
  return (
    <div className="h-full [&>div]:h-full [&>div]:min-h-auto [&>div]:border">
      <NotFound />
    </div>
  )
}
