"use client"

import { useExtracted } from "next-intl"
import { z } from "zod"

import { CATEGORY_TYPES } from "@/lib/categories"
import { CURRENCIES } from "@/lib/currency"
import { normalizeToUTCDate } from "@/lib/utils"

export function useSchemas() {
  const t = useExtracted()

  const basePasswordSchema = () =>
    z
      .string()
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
        message: t(
          "Password must have at least 8 characters, including uppercase, lowercase, number and special character."
        ),
      })

  const baseAmount = () =>
    z
      .string()
      .min(1, { message: t("Amount is required.") })
      .regex(/^\d+(\.\d+)?$/, {
        message: t("Amount must be a valid number."),
      })
      .transform((val) => parseFloat(val))
      .refine((num) => num >= 0.01, {
        message: t("Amount must be greater than 0."),
      })
      .refine((num) => num <= 100000000000, {
        message: t("Maximum amount is 100 billion."),
      })
      .transform((num) => num.toString())

  const createSignInSchema = () =>
    z.object({
      username: z.string().min(1, { message: t("Username is required.") }),
      password: basePasswordSchema(),
    })

  const createPasswordSchema = () =>
    z
      .object({
        currentPassword: z
          .string()
          .min(1, { message: t("Current password is required.") }),
        newPassword: basePasswordSchema(),
        confirmPassword: z
          .string()
          .min(1, { message: t("Please confirm your new password.") }),
        revokeOtherSessions: z.boolean(),
      })
      .superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            message: t("Passwords do not match."),
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
          message: t("Enter the 6-digit code from your authenticator app."),
        })
        .max(10, { message: t("Code must be at most 10 digits.") })
        .regex(/^\d+$/, {
          message: t("Code can only contain digits."),
        }),
      trustDevice: z.boolean().optional(),
    })

  const createNameSchema = () =>
    z.object({
      name: z
        .string()
        .min(1, { message: t("Name is required.") })
        .max(100, { message: t("Name must be at most 100 characters.") }),
    })

  const createUsernameSchema = () =>
    z.object({
      username: z
        .string()
        .min(3, { message: t("Username must have at least 3 characters.") })
        .max(30, { message: t("Username must be at most 30 characters.") })
        .regex(/^[a-zA-Z0-9_.]+$/, {
          message: t(
            "Username can only contain letters, numbers, underscores, and dots."
          ),
        }),
    })

  const createTransactionSchema = () =>
    z.object({
      type: z.enum(CATEGORY_TYPES, {
        message: t("Please select a transaction type."),
      }),
      categoryKey: z.string().min(1, { message: t("Category is required.") }),
      currency: z.enum(CURRENCIES, {
        message: t("Please select a currency."),
      }),
      amount: baseAmount(),
      description: z
        .string()
        .min(1, {
          message: t("Description is required."),
        })
        .max(200, {
          message: t("Description must be at most 200 characters."),
        }),
      date: z.date({
        message: t("Please select a date."),
      }),
    })

  const createCategorySchema = () =>
    z.object({
      categoryKey: z.string().optional(),
      type: z.enum(CATEGORY_TYPES, {
        message: t("Please select a type."),
      }),
      label: z
        .string()
        .min(1, { message: t("Category name is required.") })
        .max(50, {
          message: t("Category name must be at most 50 characters."),
        }),
      description: z
        .string()
        .min(1, { message: t("Description is required.") })
        .max(200, {
          message: t("Description must be at most 200 characters."),
        }),
    })

  const createBudgetSchema = () =>
    z
      .object({
        categoryKey: z.string().min(1, { message: t("Category is required.") }),
        currency: z.enum(CURRENCIES, {
          message: t("Please select a currency."),
        }),
        allocatedAmount: baseAmount(),
        startDate: z.date({
          message: t("Please select a start date."),
        }),
        endDate: z.date({
          message: t("Please select an end date."),
        }),
      })
      .superRefine((data, ctx) => {
        if (data.endDate <= data.startDate) {
          ctx.addIssue({
            path: ["endDate"],
            message: t("End date must be after start date."),
            code: "custom",
          })
        }
      })

  const createGoalSchema = () =>
    z
      .object({
        name: z
          .string()
          .min(1, { message: t("Goal name is required.") })
          .max(100, {
            message: t("Goal name must be at most 100 characters."),
          }),
        categoryKey: z.string().min(1, { message: t("Category is required.") }),
        currency: z.enum(CURRENCIES, {
          message: t("Please select a currency."),
        }),
        targetAmount: baseAmount(),
        startDate: z.date({
          message: t("Please select a start date."),
        }),
        endDate: z.date({
          message: t("Please select an end date."),
        }),
      })
      .superRefine((data, ctx) => {
        if (data.endDate <= data.startDate) {
          ctx.addIssue({
            path: ["endDate"],
            message: t("End date must be after start date."),
            code: "custom",
          })
        }
      })

  const createRecurringTransactionSchema = () =>
    z
      .object({
        type: z.enum(CATEGORY_TYPES, {
          message: t("Please select a type."),
        }),
        categoryKey: z.string().min(1, { message: t("Category is required.") }),
        currency: z.enum(CURRENCIES, {
          message: t("Please select a currency."),
        }),
        amount: baseAmount(),
        description: z
          .string()
          .min(1, {
            message: t("Description is required."),
          })
          .max(200, {
            message: t("Description must be at most 200 characters."),
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
            message: t("Please select a frequency."),
          }
        ),
        randomEveryXDays: z
          .number()
          .min(1, {
            message: t("Please enter the number of days."),
          })
          .max(365, {
            message: t("The number of days must not exceed 365."),
          })
          .optional(),
        startDate: z.date({
          message: t("Please select a start date."),
        }),
        endDate: z.date().optional(),
        lastGenerated: z.date().optional(),
        isActive: z.boolean(),
      })
      .superRefine((data, ctx) => {
        if (data.endDate && data.endDate <= data.startDate) {
          ctx.addIssue({
            path: ["endDate"],
            message: t("End date must be after start date."),
            code: "custom",
          })
        }

        const today = normalizeToUTCDate(new Date())
        if (
          data.isActive &&
          data.endDate &&
          normalizeToUTCDate(data.endDate) < today
        ) {
          ctx.addIssue({
            path: ["isActive"],
            message: t(
              "Cannot activate a recurring transaction that has already expired."
            ),
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
