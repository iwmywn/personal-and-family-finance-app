import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LanguageSelector } from "@/components/auth/language-selector"
import { SignInForm } from "@/components/auth/signin-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Sign In") }
}

export default async function page() {
  const t = await getExtracted()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Sign In")}</CardTitle>
        <CardDescription>
          {t("Enter your username and password to sign in to your account.")}
        </CardDescription>
        <CardAction>
          <LanguageSelector />
        </CardAction>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
