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
  const tSettings = await getTranslations("settings")

  return {
    title: tSettings("title"),
  }
}

export default async function page() {
  const tSettings = await getTranslations("settings")

  return (
    <BasePage>
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">{tSettings("general")}</TabsTrigger>
          <TabsTrigger value="account">{tSettings("account")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tSettings("appearance")}</CardTitle>
              <CardDescription>
                {tSettings("appearanceDescription")}
              </CardDescription>
              <CardAction>
                <DashboardThemeToggle />
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tSettings("language")}</CardTitle>
              <CardDescription>
                {tSettings("languageDescription")}
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
              <CardTitle>{tSettings("changePassword")}</CardTitle>
              <CardDescription>
                {tSettings("changePasswordDescription")}
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
