import type { Metadata } from "next"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardThemeToggle } from "@/components/mode-toggle"
import { AccountForm } from "@/components/settings/account-form"

export const metadata: Metadata = {
  title: "Cài đặt",
}

export default function page() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
          <CardDescription>Chọn chủ đề hiển thị cho ứng dụng.</CardDescription>
          <CardAction>
            <DashboardThemeToggle />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Thay đổi mật khẩu của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
