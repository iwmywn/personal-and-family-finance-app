import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_URL: z.string().min(1),
    NEXT_PUBLIC_NODE_ENV: z.string().min(1),
    NEXT_PUBLIC_RECAPTCHA: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_RECAPTCHA: process.env.NEXT_PUBLIC_RECAPTCHA,
  },
})
