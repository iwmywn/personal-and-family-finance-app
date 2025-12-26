"use client"

import { useExtracted } from "next-intl"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveSessionsDialog } from "@/components/settings/active-sessions-dialog"
import { ChangeNameDialog } from "@/components/settings/change-name-dialog"
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog"
import { ChangeUsernameDialog } from "@/components/settings/change-username-dialog"
import { CurrencySelector } from "@/components/settings/currency-selector"
import { LanguageSelector } from "@/components/settings/language-selector"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { TwoFactorManagerDialog } from "@/components/settings/two-factor-manager-dialog"

export default function SettingsPage() {
  const t = useExtracted()

  return (
    <Tabs defaultValue="general">
      <TabsList className="w-full">
        <TabsTrigger value="general">{t("General")}</TabsTrigger>
        <TabsTrigger value="account">{t("Account")}</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Appearance")}</CardTitle>
            <CardDescription>
              {t("Choose the display theme for the application.")}
            </CardDescription>
            <CardAction>
              <ThemeSelector />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Language")}</CardTitle>
            <CardDescription>
              {t("Select your preferred language.")}
            </CardDescription>
            <CardAction>
              <LanguageSelector />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Currency")}</CardTitle>
            <CardDescription>
              {t("Select your preferred currency for displaying amounts.")}
            </CardDescription>
            <CardAction>
              <CurrencySelector />
            </CardAction>
          </CardHeader>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Change Name")}</CardTitle>
            <CardDescription>{t("Update your display name.")}</CardDescription>
            <CardAction>
              <ChangeNameDialog />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Change Username")}</CardTitle>
            <CardDescription>
              {t("Update your unique username.")}
            </CardDescription>
            <CardAction>
              <ChangeUsernameDialog />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Change Password")}</CardTitle>
            <CardDescription>{t("Update your password.")}</CardDescription>
            <CardAction>
              <ChangePasswordDialog />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Two-Factor Authentication")}</CardTitle>
            <CardDescription>
              {t("Add an extra layer of security to your account.")}
            </CardDescription>
            <CardAction>
              <TwoFactorManagerDialog />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Active Sessions")}</CardTitle>
            <CardDescription>
              {t("Manage your active sessions.")}
            </CardDescription>
            <CardAction>
              <ActiveSessionsDialog />
            </CardAction>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
