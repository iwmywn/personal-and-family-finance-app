import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import { getAdminStats, listUsers } from "@/actions/admin.actions"
import AdminPage from "@/components/admin/admin-page"
import { ErrorEmptyState } from "@/components/layout/error-empty-state"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return {
    title: t("Admin Management"),
  }
}

export default async function page() {
  const t = await getExtracted()

  const [statsResult, usersResult] = await Promise.all([
    getAdminStats(),
    listUsers(),
  ])

  if (!statsResult?.stats) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH ADMIN STATS DATA")}
        description={statsResult?.error}
      />
    )
  }

  if (!usersResult?.users) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH USERS DATA")}
        description={usersResult?.error}
      />
    )
  }

  return (
    <AdminPage
      initialStats={statsResult.stats}
      initialUsers={usersResult.users}
    />
  )
}
