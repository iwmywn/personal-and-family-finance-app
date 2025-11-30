"use client"

import {
  ChartColumnIncreasingIcon,
  HomeIcon,
  PiggyBankIcon,
  RepeatIcon,
  SettingsIcon,
  TagIcon,
  TargetIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"
import { useExtracted } from "next-intl"

type NavType = {
  url: string
  icon: LucideIcon
  label: string
}
export function useNav() {
  const t = useExtracted()

  const mainNav: NavType[] = [
    {
      url: "/home",
      icon: HomeIcon,
      label: t("Home"),
    },
    {
      url: "/statistics",
      icon: ChartColumnIncreasingIcon,
      label: t("Statistics"),
    },
    {
      url: "/transactions",
      icon: WalletIcon,
      label: t("Transactions"),
    },
    {
      url: "/categories",
      icon: TagIcon,
      label: t("Categories"),
    },
    {
      url: "/budgets",
      icon: PiggyBankIcon,
      label: t("Budgets"),
    },
    {
      url: "/goals",
      icon: TargetIcon,
      label: t("Goals"),
    },
    {
      url: "/recurring",
      icon: RepeatIcon,
      label: t("Recurring"),
    },
  ]

  const secondaryNav: NavType[] = [
    {
      url: "/settings",
      icon: SettingsIcon,
      label: t("Settings"),
    },
  ]

  return { mainNav, secondaryNav }
}
