import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TwoFactorVerificationForm } from "@/components/auth/two-factor-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Two-Factor Authentication") }
}

export default async function page() {
  const t = await getExtracted()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Two-Factor Authentication")}</CardTitle>
        <CardDescription>
          {t("Enter the code from your authenticator app.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorVerificationForm />
      </CardContent>
    </Card>
  )
}
