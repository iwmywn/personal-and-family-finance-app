"use client"

import { useTranslations } from "next-intl"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageSelector } from "@/components/settings/language-selector"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { UpdatePasswordDialog } from "@/components/settings/update-password-dialog"

export default function SettingsPage() {
  const t = useTranslations()

  return (
    <Tabs defaultValue="general">
      <TabsList className="w-full">
        <TabsTrigger value="general">{t("settings.fe.general")}</TabsTrigger>
        <TabsTrigger value="account">{t("settings.fe.account")}</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.fe.appearance")}</CardTitle>
            <CardDescription>
              {t("settings.fe.appearanceDescription")}
            </CardDescription>
            <CardAction>
              <ThemeSelector />
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.fe.language")}</CardTitle>
            <CardDescription>
              {t("settings.fe.languageDescription")}
            </CardDescription>
            <CardAction>
              <LanguageSelector />
            </CardAction>
          </CardHeader>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.fe.changePassword")}</CardTitle>
            <CardDescription>
              {t("settings.fe.changePasswordDescription")}
            </CardDescription>
            <CardAction>
              <UpdatePasswordDialog />
            </CardAction>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
