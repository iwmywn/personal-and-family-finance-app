import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"
import { admin, captcha, twoFactor, username } from "better-auth/plugins"
import { adminAc, defaultAc, userAc } from "better-auth/plugins/admin/access"
import * as z from "zod"

import { siteConfig } from "@/app/pffa.config"
import { clientEnv } from "@/env/client"
import { serverEnv } from "@/env/server"
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config"
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency"
import { connect } from "@/lib/db"
import { ADMIN_ROLES, DEFAULT_ROLE, ROLES } from "@/lib/role"

export const auth = betterAuth({
  appName: siteConfig.name,
  database: mongodbAdapter(await connect()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  account: {
    modelName: "accounts",
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 0,
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: DEFAULT_ROLE,
        validator: {
          input: z.enum(ROLES),
        },
      },
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
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          return {
            data: {
              ...user,
              emailVerified: true,
            },
          }
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: DEFAULT_ROLE,
      adminRoles: [...ADMIN_ROLES],
      roles: {
        user: userAc,
        admin: adminAc,
        superadmin: defaultAc.newRole(defaultAc.statements),
      },
    }),
    captcha({
      provider: "google-recaptcha",
      secretKey: serverEnv.RECAPTCHA_SECRET,
      endpoints: ["/sign-in/username"],
      minScore: 0.5,
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
  rateLimit: {
    modelName: "rateLimits",
    storage: "database",
    enabled: clientEnv.NEXT_PUBLIC_NODE_ENV === "production",
    customRules: {
      "/sign-in/username": {
        window: 60,
        max: 5,
      },
    },
  },
  secret: serverEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [clientEnv.NEXT_PUBLIC_URL],
  baseURL: clientEnv.NEXT_PUBLIC_URL,
})
