import type { Metadata } from "next"
import Link from "next/link"
import { GhostIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export async function generateMetadata(): Promise<Metadata> {
  const tCommonFE = await getTranslations("common.fe")

  return {
    title: tCommonFE("notFound"),
  }
}

export default async function page() {
  const tNotFound = await getTranslations("notFound")
  const tCommonFE = await getTranslations("common.fe")

  return (
    <Empty className="h-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GhostIcon />
        </EmptyMedia>
        <EmptyTitle>{tNotFound("title")}</EmptyTitle>
        <EmptyDescription>{tNotFound("description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/home">{tCommonFE("backToHome")}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
