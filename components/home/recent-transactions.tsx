"use client"

import { Fragment } from "react"
import { WalletIcon } from "lucide-react"
import { useExtracted } from "next-intl"

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
import { useAppData } from "@/context/app-data-context"
import { useCategory } from "@/hooks/use-category"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useFormatDate } from "@/hooks/use-format-date"
import { useMediaQuery } from "@/hooks/use-media-query"
import { formatCurrency } from "@/lib/utils"

interface RecentTransactionsProps {
  offsetHeight: number
}

export function RecentTransactions({ offsetHeight }: RecentTransactionsProps) {
  const isMediumScreens = useMediaQuery("(max-width: 767px)")
  const { transactions } = useAppData()
  const recentTransactions = transactions.slice(0, 10)
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
  const t = useExtracted()
  const { getCategoryLabel } = useCategory()
  const formatDate = useFormatDate()

  return (
    <Card className="relative overflow-hidden py-0 pb-6">
      <CardHeader ref={registerRef} className="bg-card sticky top-0 pt-6">
        <CardTitle>{t("Recent Transactions")}</CardTitle>
      </CardHeader>
      <CardContent
        className="overflow-y-auto"
        style={{
          height: isMediumScreens
            ? "auto"
            : `calc(100vh - 9.5rem - ${offsetHeight}px - ${calculatedHeight}px)`,
          maxHeight: isMediumScreens ? "300px" : "none",
        }}
      >
        <div className="h-full space-y-4">
          {recentTransactions.length === 0 ? (
            <Empty className="h-full border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WalletIcon />
                </EmptyMedia>
                <EmptyTitle>{t("No transactions found")}</EmptyTitle>
                <EmptyDescription>
                  {t("Start adding your transactions.")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            recentTransactions.map((transaction, index) => (
              <Fragment key={transaction._id}>
                <div className="flex items-center justify-between">
                  <div className="flex max-w-2/4 items-center space-x-3">
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={
                          transaction.type === "income"
                            ? "badge-green"
                            : "badge-red"
                        }
                      >
                        {getCategoryLabel(transaction.categoryKey)}
                      </Badge>
                      <div className="text-sm wrap-anywhere">
                        {transaction.description}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                  <div className="max-w-2/4 text-right">
                    <div
                      className={`text-sm wrap-anywhere ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
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
