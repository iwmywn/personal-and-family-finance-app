import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignInForm } from "@/components/auth/signin-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("auth.fe.signIn") }
}

export default async function page() {
  const t = await getTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.fe.signIn")}</CardTitle>
        <CardDescription>{t("auth.fe.signInDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
