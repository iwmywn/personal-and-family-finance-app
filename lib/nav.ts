import type { NamespacedKey } from "@/i18n/types"
import {
  ChartColumnIncreasing,
  FolderOpen,
  Home,
  PiggyBank,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react"

type NavType = {
  key: NamespacedKey<"navigation">
  url: string
  icon: LucideIcon
}

export const mainNav: NavType[] = [
  {
    key: "home",
    url: "/home",
    icon: Home,
  },
  {
    key: "statistics",
    url: "/statistics",
    icon: ChartColumnIncreasing,
  },
  {
    key: "transactions",
    url: "/transactions",
    icon: Wallet,
  },
  {
    key: "categories",
    url: "/categories",
    icon: FolderOpen,
  },
  {
    key: "budgets",
    url: "/budgets",
    icon: PiggyBank,
  },
]

export const secondaryNav: NavType[] = [
  {
    key: "settings",
    url: "/settings",
    icon: Settings,
  },
]
