import type { Metadata } from "next"
import Link from "next/link"
import { Ghost } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateIcon,
} from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "NOT FOUND",
}

export default function NotFound({ className }: { className?: string }) {
  return (
    <EmptyState className={cn("min-h-screen border-none", className)}>
      <EmptyStateIcon>
        <Ghost />
      </EmptyStateIcon>
      <EmptyStateHeader>
        THE PAGE YOU ARE LOOKING FOR COULD NOT BE FOUND
      </EmptyStateHeader>
      <EmptyStateDescription>This page does not exist.</EmptyStateDescription>
      <EmptyStateAction>
        <Button asChild>
          <Link href="/home">Go home</Link>
        </Button>
      </EmptyStateAction>
    </EmptyState>
  )
}
