import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function FormButton({
  isSubmitting,
  children,
  className,
  ...props
}: {
  isSubmitting: boolean
  children: React.ReactNode
  className?: string
} & React.ComponentProps<"button">) {
  return (
    <Button
      className={cn(className)}
      disabled={isSubmitting}
      type="submit"
      {...props}
    >
      <span className="flex items-center gap-2">
        {isSubmitting && <Spinner />} {children}
      </span>
    </Button>
  )
}
