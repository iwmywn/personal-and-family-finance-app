import {
  ChartColumnIncreasingIcon,
  FolderOpenIcon,
  HomeIcon,
  PiggyBankIcon,
  RepeatIcon,
  SettingsIcon,
  TargetIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

import type { NamespacedKey } from "@/i18n/types"

type NavType = {
  key: NamespacedKey<"navigation">
  url: string
  icon: LucideIcon
}

export const mainNav: NavType[] = [
  {
    key: "home",
    url: "/home",
    icon: HomeIcon,
  },
  {
    key: "statistics",
    url: "/statistics",
    icon: ChartColumnIncreasingIcon,
  },
  {
    key: "transactions",
    url: "/transactions",
    icon: WalletIcon,
  },
  {
    key: "categories",
    url: "/categories",
    icon: FolderOpenIcon,
  },
  {
    key: "budgets",
    url: "/budgets",
    icon: PiggyBankIcon,
  },
  {
    key: "goals",
    url: "/goals",
    icon: TargetIcon,
  },
  {
    key: "recurring",
    url: "/recurring",
    icon: RepeatIcon,
  },
]

export const secondaryNav: NavType[] = [
  {
    key: "settings",
    url: "/settings",
    icon: SettingsIcon,
  },
]
