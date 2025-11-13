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
  const t = await getTranslations()

  return {
    title: t("common.fe.notFound"),
  }
}

export default async function page() {
  const t = await getTranslations()

  return (
    <Empty className="h-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GhostIcon />
        </EmptyMedia>
        <EmptyTitle>{t("notFound.title")}</EmptyTitle>
        <EmptyDescription>{t("notFound.description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/home">{t("common.fe.backToHome")}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
