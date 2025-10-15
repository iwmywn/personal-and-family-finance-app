import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AccountForm } from "@/components/settings/account-form"

export const metadata: Metadata = {
  title: "Cài đặt",
}

export default function page() {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
        <CardDescription>Thay đổi mật khẩu của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <AccountForm />
      </CardContent>
    </Card>
  )
}
