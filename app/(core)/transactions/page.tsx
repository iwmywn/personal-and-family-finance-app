import type { Metadata } from "next"

import TransactionsPage from "@/components/transactions/transactions-page"

export function generateMetadata(): Metadata {
  return { title: "Giao dịch" }
}

export default function page() {
  return <TransactionsPage />
}
