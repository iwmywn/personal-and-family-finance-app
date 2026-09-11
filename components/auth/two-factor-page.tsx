"use client"

import { useExtracted } from "next-intl"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TwoFactorVerificationForm } from "@/components/auth/two-factor-form"

export function TwoFactorPage() {
  const t = useExtracted()

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
