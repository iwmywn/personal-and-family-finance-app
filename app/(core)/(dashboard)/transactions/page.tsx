import type { Metadata } from "next"

import Transactions from "@/components/transactions/transactions"

export function generateMetadata(): Metadata {
  return { title: "Giao dịch" }
}

export default function page() {
  return <Transactions />
}
