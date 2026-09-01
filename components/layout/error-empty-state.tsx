"use client"

import { GhostIcon } from "lucide-react"
import { useExtracted } from "next-intl"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface ErrorEmptyStateProps {
  title: string
  description?: string
}

export function ErrorEmptyState({ title, description }: ErrorEmptyStateProps) {
  const t = useExtracted()

  return (
    <Empty className="h-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GhostIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description ?? t("Please try again later.")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
