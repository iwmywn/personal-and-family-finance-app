"use client"

import {
  ShieldAlertIcon,
  UserCheckIcon,
  UsersIcon,
  UserXIcon,
} from "lucide-react"
import { useExtracted } from "next-intl"

import type { AdminStats } from "@/actions/admin.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminSummaryProps {
  stats: AdminStats
}

export function AdminSummary({ stats }: AdminSummaryProps) {
  const t = useExtracted()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Total Users")}</CardTitle>
          <UsersIcon className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm">
            {t("Registered accounts")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Active Users")}</CardTitle>
          <UserCheckIcon className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-green-600">
            {stats.activeUsers.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm">
            {t("Unrestricted access")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Banned Users")}</CardTitle>
          <UserXIcon className="size-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl wrap-anywhere text-red-600">
            {stats.bannedUsers.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm">
            {t("Suspended accounts")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t("Administrators")}</CardTitle>
          <ShieldAlertIcon className="text-primary size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-primary text-2xl wrap-anywhere">
            {stats.adminUsers.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm">
            {t("Full system privileges")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
