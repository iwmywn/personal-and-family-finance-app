import type { Metadata } from "next"

import TransactionFilters from "@/components/transactions/transaction-filters"

export function generateMetadata(): Metadata {
  return { title: "Giao dịch" }
}

export default function page() {
  return <TransactionFilters />
}
