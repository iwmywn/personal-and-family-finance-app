import { Suspense } from "react"
import type { Metadata } from "next"
import { connection } from "next/server"
import { getExtracted } from "next-intl/server"

import { SignInPage } from "@/components/auth/signin-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Sign In") }
}

async function DynamicMarker() {
  await connection()
  return null
}

export default function page() {
  return (
    <>
      <SignInPage />
      <Suspense>
        <DynamicMarker />
      </Suspense>
    </>
  )
}
