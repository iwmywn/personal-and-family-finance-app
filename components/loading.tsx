import { cn } from "@/lib/utils"

export function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-primary-foreground border-t-primary/10 mx-auto size-4 animate-spin rounded-full border-4",
        className
      )}
    />
  )
}
