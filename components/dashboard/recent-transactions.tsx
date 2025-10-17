"use client"

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
import { getCategoryLabel } from "@/lib/categories"
import type { Transaction } from "@/lib/definitions"
import { formatCurrency, formatDate } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 10)

  return (
    <Card className="relative py-0 pb-6">
      <CardHeader className="sticky top-0 bg-card pt-6">
        <CardTitle>10 giao dịch gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <Empty className="border border-dashed">
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
              <>
                <div
                  key={transaction._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 max-w-3/4">
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          transaction.type === "income"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {getCategoryLabel(transaction.category)}
                      </Badge>
                      <p className="text-sm">{transaction.description}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm ${
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
              </>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
