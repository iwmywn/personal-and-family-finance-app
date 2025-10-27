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
  const tAuthFE = await getTranslations("auth.fe")

  return { title: tAuthFE("signIn") }
}

export default async function page() {
  const tAuthFE = await getTranslations("auth.fe")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tAuthFE("signIn")}</CardTitle>
        <CardDescription>{tAuthFE("signInDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
