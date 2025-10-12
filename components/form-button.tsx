import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function FormButton({
  isSubmitting,
  text,
  className,
  ...props
}: {
  isSubmitting: boolean
  text: string
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
        {isSubmitting && <Spinner />} {text}
      </span>
    </Button>
  )
}
