import type { Metadata } from "next"
import Link from "next/link"
import { Ghost } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "KHÔNG TÌM THẤY",
}

export default function NotFound() {
  return (
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ghost />
        </EmptyMedia>
        <EmptyTitle>KHÔNG TÌM THẤY TRANG BẠN ĐANG TÌM KIẾM</EmptyTitle>
        <EmptyDescription>Trang này không tồn tại.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/home">Về trang chủ</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
