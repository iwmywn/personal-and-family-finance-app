"use client"

import { useExtracted } from "next-intl"

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

export function SignInPage() {
  const t = useExtracted()

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
