import type { Metadata } from "next"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardThemeToggle } from "@/components/mode-toggle"
import { UpdatePasswordForm } from "@/components/settings/update-password-form"

export const metadata: Metadata = {
  title: "Cài đặt",
}

export default function page() {
  return (
    <>
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giao diện</CardTitle>
              <CardDescription>
                Chọn chủ đề hiển thị cho ứng dụng.
              </CardDescription>
              <CardAction>
                <DashboardThemeToggle />
              </CardAction>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Thay đổi mật khẩu của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
