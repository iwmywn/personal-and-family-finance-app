import { type AnchorHTMLAttributes, type ReactNode } from "react"
import Link, { type LinkProps } from "next/link"

import { cn } from "@/lib/utils"

type FormLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    side?: "none" | "left" | "right" | "center"
    children: ReactNode
    className?: string
  }

export function FormLink({
  href,
  children,
  className,
  ...props
}: FormLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex w-fit shrink-0 items-center justify-center gap-1 text-sm whitespace-nowrap after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-center after:scale-x-0 after:bg-black after:transition-all after:duration-500 hover:after:scale-x-100 dark:after:bg-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
