import { Nunito } from "next/font/google"

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  fallback: ["var(--font-sans)"],
})

export { nunito }
