import Image from "next/image"

import { siteConfig } from "@/app/pffa.config"
import { cn } from "@/lib/utils"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  isLoading?: boolean
}

export function Logo({
  width = 32,
  height = 32,
  className,
  isLoading,
}: LogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt={`${siteConfig.name} Logo`}
      width={width}
      height={height}
      aria-label={isLoading ? "Loading" : undefined}
      className={cn(isLoading && "animate-spin", className)}
    />
  )
}
