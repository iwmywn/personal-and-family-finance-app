"use client"

import { Fragment } from "react"
import { Receipt } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getCategoryLabel } from "@/lib/categories"
import type { Transaction } from "@/lib/definitions"
import { useCustomCategories } from "@/lib/swr"
import { formatCurrency, formatDate } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transaction[]
  offsetHeight: number
}

export function RecentTransactions({
  transactions,
  offsetHeight,
}: RecentTransactionsProps) {
  const isMediumScreens = useMediaQuery("(max-width: 767px)")
  const recentTransactions = transactions.slice(0, 10)
  const { categories: customCategories } = useCustomCategories()
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()

  return (
    <Card className="relative overflow-hidden py-0 pb-6">
      <CardHeader ref={registerRef} className="bg-card sticky top-0 pt-6">
        <CardTitle>10 giao dịch gần đây</CardTitle>
      </CardHeader>
      <CardContent
        className="h-full overflow-y-auto"
        style={{
          maxHeight: isMediumScreens
            ? "300px"
            : `calc(100vh - 10rem - ${offsetHeight}px - ${calculatedHeight}px)`,
        }}
      >
        <div className="h-full space-y-4">
          {recentTransactions.length === 0 ? (
            <Empty className="h-full border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Receipt />
                </EmptyMedia>
                <EmptyTitle className="text-base">
                  Không tìm thấy giao dịch
                </EmptyTitle>
                <EmptyDescription className="text-sm">
                  Bắt đầu thêm giao dịch của bạn.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            recentTransactions.map((transaction, index) => (
              <Fragment key={transaction._id}>
                <div className="flex items-center justify-between">
                  <div className="flex max-w-3/4 items-center space-x-3">
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={
                          transaction.type === "income"
                            ? "badge-income"
                            : "badge-expense"
                        }
                      >
                        {getCategoryLabel(
                          transaction.category,
                          customCategories
                        )}
                      </Badge>
                      <p className="text-sm wrap-anywhere">
                        {transaction.description}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                  <div className="max-w-1/4 text-right">
                    <p
                      className={`text-sm wrap-anywhere ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>

                {index !== recentTransactions.length - 1 && <Separator />}
              </Fragment>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
