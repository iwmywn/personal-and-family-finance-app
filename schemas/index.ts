import * as z from "zod"

import { CATEGORY_TYPES } from "@/lib/categories"
import { CURRENCIES } from "@/lib/currency"
import { localDateToUTCMidnight } from "@/lib/utils"
import type { SchemaMessages } from "@/schemas/messages"

export function buildSchemas(messages: SchemaMessages) {
  const basePasswordSchema = () =>
    z
      .string()
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
        message: messages.passwordFormat,
      })

  const baseAmount = () =>
    z
      .string()
      .min(1, { message: messages.amountRequired })
      .regex(/^\d+(\.\d+)?$/, {
        message: messages.amountInvalidNumber,
      })
      .transform((val) => parseFloat(val))
      .refine((num) => num >= 0.01, {
        message: messages.amountMin,
      })
      .refine((num) => num <= 100000000000, {
        message: messages.amountMax,
      })
      .transform((num) => num.toString())

  const createSignInSchema = () =>
    z.object({
      username: z.string().min(1, { message: messages.usernameRequired }),
      password: basePasswordSchema(),
    })

  const createPasswordSchema = () =>
    z
      .object({
        currentPassword: z
          .string()
          .min(1, { message: messages.currentPasswordRequired }),
        newPassword: basePasswordSchema(),
        confirmPassword: z
          .string()
          .min(1, { message: messages.confirmNewPassword }),
        revokeOtherSessions: z.boolean(),
      })
      .superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            message: messages.passwordsDoNotMatch,
            code: "custom",
          })
        }
      })

  const createTwoFactorPasswordSchema = () =>
    z.object({
      password: basePasswordSchema(),
    })

  const createTwoFactorCodeSchema = () =>
    z.object({
      code: z
        .string()
        .min(6, {
          message: messages.authenticatorCodeRequired,
        })
        .max(10, { message: messages.codeMaxLength })
        .regex(/^\d+$/, {
          message: messages.codeDigitsOnly,
        }),
      trustDevice: z.boolean().optional(),
    })

  const createNameSchema = () =>
    z.object({
      name: z
        .string()
        .min(1, { message: messages.nameRequired })
        .max(100, { message: messages.nameMaxLength }),
    })

  const createUsernameSchema = () =>
    z.object({
      username: z
        .string()
        .min(3, { message: messages.usernameMinLength })
        .max(30, { message: messages.usernameMaxLength })
        .regex(/^[a-zA-Z0-9_.]+$/, {
          message: messages.usernameFormat,
        }),
    })

  const createTransactionSchema = () =>
    z.object({
      type: z.enum(CATEGORY_TYPES, {
        message: messages.transactionTypeRequired,
      }),
      categoryKey: z.string().min(1, { message: messages.categoryRequired }),
      currency: z.enum(CURRENCIES, {
        message: messages.currencyRequired,
      }),
      amount: baseAmount(),
      description: z
        .string()
        .min(1, {
          message: messages.descriptionRequired,
        })
        .max(200, {
          message: messages.descriptionMaxLength,
        }),
      date: z.date({
        message: messages.dateRequired,
      }),
    })

  const createCategorySchema = () =>
    z.object({
      categoryKey: z.string().optional(),
      type: z.enum(CATEGORY_TYPES, {
        message: messages.typeRequired,
      }),
      label: z
        .string()
        .min(1, { message: messages.categoryNameRequired })
        .max(50, {
          message: messages.categoryNameMaxLength,
        }),
      description: z
        .string()
        .min(1, { message: messages.descriptionRequired })
        .max(200, {
          message: messages.descriptionMaxLength,
        }),
    })

  const createBudgetSchema = () =>
    z
      .object({
        categoryKey: z.string().min(1, { message: messages.categoryRequired }),
        currency: z.enum(CURRENCIES, {
          message: messages.currencyRequired,
        }),
        allocatedAmount: baseAmount(),
        startDate: z.date({
          message: messages.startDateRequired,
        }),
        endDate: z.date({
          message: messages.endDateRequired,
        }),
      })
      .superRefine((data, ctx) => {
        if (data.endDate <= data.startDate) {
          ctx.addIssue({
            path: ["endDate"],
            message: messages.endDateAfterStartDate,
            code: "custom",
          })
        }
      })

  const createGoalSchema = () =>
    z
      .object({
        name: z
          .string()
          .min(1, { message: messages.goalNameRequired })
          .max(100, {
            message: messages.goalNameMaxLength,
          }),
        categoryKey: z.string().min(1, { message: messages.categoryRequired }),
        currency: z.enum(CURRENCIES, {
          message: messages.currencyRequired,
        }),
        targetAmount: baseAmount(),
        startDate: z.date({
          message: messages.startDateRequired,
        }),
        endDate: z.date({
          message: messages.endDateRequired,
        }),
      })
      .superRefine((data, ctx) => {
        if (data.endDate <= data.startDate) {
          ctx.addIssue({
            path: ["endDate"],
            message: messages.endDateAfterStartDate,
            code: "custom",
          })
        }
      })

  const createRecurringTransactionSchema = () =>
    z
      .object({
        type: z.enum(CATEGORY_TYPES, {
          message: messages.typeRequired,
        }),
        categoryKey: z.string().min(1, { message: messages.categoryRequired }),
        currency: z.enum(CURRENCIES, {
          message: messages.currencyRequired,
        }),
        amount: baseAmount(),
        description: z
          .string()
          .min(1, {
            message: messages.descriptionRequired,
          })
          .max(200, {
            message: messages.descriptionMaxLength,
          }),
        frequency: z.enum(
          [
            "daily",
            "weekly",
            "bi-weekly",
            "monthly",
            "quarterly",
            "yearly",
            "random",
          ],
          {
            message: messages.frequencyRequired,
          }
        ),
        randomEveryXDays: z
          .number()
          .min(1, {
            message: messages.randomDaysRequired,
          })
          .max(365, {
            message: messages.randomDaysMax,
          })
          .optional(),
        startDate: z.date({
          message: messages.startDateRequired,
        }),
        endDate: z.date().optional(),
        lastGenerated: z.date().optional(),
        isActive: z.boolean(),
      })
      .superRefine((data, ctx) => {
        if (data.endDate && data.endDate <= data.startDate) {
          ctx.addIssue({
            path: ["endDate"],
            message: messages.endDateAfterStartDate,
            code: "custom",
          })
        }

        if (
          data.isActive &&
          data.endDate &&
          localDateToUTCMidnight(data.endDate) <
            localDateToUTCMidnight(new Date())
        ) {
          ctx.addIssue({
            path: ["isActive"],
            message: messages.expiredRecurringActivation,
            code: "custom",
          })
        }
      })

  return {
    createSignInSchema,
    createPasswordSchema,
    createTwoFactorPasswordSchema,
    createTwoFactorCodeSchema,
    createNameSchema,
    createUsernameSchema,
    createTransactionSchema,
    createCategorySchema,
    createBudgetSchema,
    createGoalSchema,
    createRecurringTransactionSchema,
  }
}
