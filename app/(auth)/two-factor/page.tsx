import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TwoFactorVerificationForm } from "@/components/auth/two-factor-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("auth.fe.twoFactorPageTitle") }
}

export default async function page() {
  const t = await getTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.fe.twoFactorHeading")}</CardTitle>
        <CardDescription>
          {t("auth.fe.twoFactorPageDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorVerificationForm />
      </CardContent>
    </Card>
  )
}
