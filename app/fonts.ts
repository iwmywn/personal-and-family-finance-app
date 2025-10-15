import { Montserrat } from "next/font/google"

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  fallback: ["var(--font-sans)"],
})

export { montserrat }
