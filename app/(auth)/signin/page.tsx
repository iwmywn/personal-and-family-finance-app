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
  const tAuth = await getTranslations("auth")

  return { title: tAuth("signIn") }
}

export default async function page() {
  const tAuth = await getTranslations("auth")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tAuth("signIn")}</CardTitle>
        <CardDescription>{tAuth("signInDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
