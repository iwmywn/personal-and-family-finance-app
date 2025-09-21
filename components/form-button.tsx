import { Button } from "@/components/ui/button"
import { Loading } from "@/components/loading"
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
      {isSubmitting ? <Loading /> : text}
    </Button>
  )
}
