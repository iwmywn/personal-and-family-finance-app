import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasePage } from "@/components/layout/base-page"
import { DashboardThemeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/settings/language-selector"
import { UpdatePasswordForm } from "@/components/settings/update-password-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings")

  return {
    title: t("title"),
  }
}

export default async function page() {
  const t = await getTranslations("settings")

  return (
    <BasePage>
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">{t("general")}</TabsTrigger>
          <TabsTrigger value="account">{t("account")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("appearance")}</CardTitle>
              <CardDescription>{t("appearanceDescription")}</CardDescription>
              <CardAction>
                <DashboardThemeToggle />
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("language")}</CardTitle>
              <CardDescription>{t("languageDescription")}</CardDescription>
              <CardAction>
                <LanguageSelector />
              </CardAction>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("changePassword")}</CardTitle>
              <CardDescription>
                {t("changePasswordDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </BasePage>
  )
}
