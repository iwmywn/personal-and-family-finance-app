import {
  ChartColumnIncreasing,
  FolderOpen,
  Home,
  Settings,
  Wallet,
} from "lucide-react"

export const mainNav = [
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
]

export const secondaryNav = [
  {
    key: "settings",
    url: "/settings",
    icon: Settings,
  },
]
