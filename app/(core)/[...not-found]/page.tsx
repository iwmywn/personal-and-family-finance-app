import type { Metadata } from "next"
import Link from "next/link"
import { GhostIcon } from "lucide-react"
import { getExtracted } from "next-intl/server"

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
  const t = await getExtracted()

  return {
    title: t("Not Found"),
  }
}

export default async function page() {
  const t = await getExtracted()

  return (
    <Empty className="h-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GhostIcon />
        </EmptyMedia>
        <EmptyTitle>{t("Page not found")}</EmptyTitle>
        <EmptyDescription>
          {t("The page you are looking for does not exist.")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/home">{t("Back to Home")}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
