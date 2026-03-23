import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"
import { captcha, twoFactor, username } from "better-auth/plugins"
import * as z from "zod"

import { siteConfig } from "@/app/pffa.config"
import { clientEnv } from "@/env/client"
import { serverEnv } from "@/env/server"
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config"
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency"
import { connect } from "@/lib/db"

export const auth = betterAuth({
  appName: siteConfig.name,
  database: mongodbAdapter(await connect()),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  account: {
    modelName: "accounts",
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    modelName: "users",
    additionalFields: {
      locale: {
        type: "string",
        required: true,
        defaultValue: DEFAULT_LOCALE,
        validator: {
          input: z.enum(LOCALES),
        },
      },
      currency: {
        type: "string",
        required: true,
        defaultValue: DEFAULT_CURRENCY,
        validator: {
          input: z.enum(CURRENCIES),
        },
      },
    },
  },
  verification: {
    modelName: "verifications",
  },
  plugins: [
    captcha({
      provider: "google-recaptcha",
      secretKey: serverEnv.RECAPTCHA_SECRET,
      endpoints: ["/sign-in/username"],
    }),
    twoFactor({
      schema: {
        twoFactor: {
          modelName: "twoFactors",
        },
      },
    }),
    username(),
    nextCookies(),
  ],
  advanced: {
    cookiePrefix: siteConfig.name,
    database: {
      generateId: false,
    },
  },
  secret: serverEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [clientEnv.NEXT_PUBLIC_URL],
  baseURL: clientEnv.NEXT_PUBLIC_URL,
})
