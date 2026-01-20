import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { captcha, twoFactor, username } from "better-auth/plugins"

import { siteConfig } from "@/app/pffa.config"
import { env as clientEnv } from "@/env/client.mjs"
import { env as serverEnv } from "@/env/server.mjs"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { DEFAULT_CURRENCY } from "@/lib/currency"
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
      },
      currency: {
        type: "string",
        required: true,
        defaultValue: DEFAULT_CURRENCY,
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
})
