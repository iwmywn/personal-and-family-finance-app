import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    RECAPTCHA_SECRET: z.string().min(1),
    CRON_SECRET: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    DB_URI: z.string().min(1),
    DB_NAME: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
})
