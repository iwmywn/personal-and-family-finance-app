import type { Metadata } from "next"

import HomePage from "@/components/homepage"

export function generateMetadata(): Metadata {
  return { title: "Home" }
}

export default function home() {
  return <HomePage />
}
