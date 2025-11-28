import { z } from "zod"

import type { TypedTranslationFunction } from "@/i18n/types"
import { ALL_CATEGORIES_KEY, TRANSACTION_TYPES } from "@/lib/categories"
import { normalizeToUTCDate } from "@/lib/utils"

const basePasswordSchema = (
  t: TypedTranslationFunction,
  message: Parameters<TypedTranslationFunction>[0]
) =>
  z
    .string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: t(message),
    })

export const createSignInSchema = (t: TypedTranslationFunction) => {
  return z.object({
    username: z
      .string()
      .min(1, { message: t("schemas.signIn.usernameRequired") }),
    password: basePasswordSchema(t, "schemas.signIn.passwordRequired"),
  })
}

export const createPasswordSchema = (t: TypedTranslationFunction) => {
  return z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: t("schemas.password.currentPasswordRequired") }),
      newPassword: basePasswordSchema(
        t,
        "schemas.password.newPasswordRequired"
      ),
      confirmPassword: z
        .string()
        .min(1, { message: t("schemas.password.confirmPasswordRequired") }),
      revokeOtherSessions: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: t("schemas.password.passwordsNotMatch"),
          code: "custom",
        })
      }
    })
}

export const createTwoFactorPasswordSchema = (t: TypedTranslationFunction) => {
  return z.object({
    password: z
      .string()
      .min(1, { message: t("schemas.twoFactor.passwordRequired") }),
  })
}

export const createTwoFactorCodeSchema = (t: TypedTranslationFunction) => {
  return z.object({
    code: z
      .string()
      .min(6, { message: t("schemas.twoFactor.codeRequired") })
      .max(10, { message: t("schemas.twoFactor.codeMaxLength") })
      .regex(/^\d+$/, {
        message: t("schemas.twoFactor.codeDigits"),
      }),
    trustDevice: z.boolean().optional(),
  })
}

export const createNameSchema = (t: TypedTranslationFunction) => {
  return z.object({
    name: z
      .string()
      .min(1, { message: t("schemas.name.nameRequired") })
      .max(100, { message: t("schemas.name.nameMaxLength") }),
  })
}

export const createUsernameSchema = (t: TypedTranslationFunction) => {
  return z.object({
    username: z
      .string()
      .min(3, { message: t("schemas.username.usernameMinLength") })
      .max(30, { message: t("schemas.username.usernameMaxLength") })
      .regex(/^[a-zA-Z0-9_.]+$/, {
        message: t("schemas.username.usernameInvalid"),
      }),
  })
}

export const createTransactionSchema = (t: TypedTranslationFunction) => {
  return z.object({
    type: z.enum(TRANSACTION_TYPES, {
      message: t("schemas.transaction.transactionTypeRequired"),
    }),
    categoryKey: z
      .string()
      .min(1, { message: t("schemas.transaction.categoryRequired") })
      .refine(
        (val) =>
          (ALL_CATEGORIES_KEY as readonly string[]).includes(val) ||
          val.startsWith("custom_"),
        { message: t("schemas.transaction.categoryRequired") }
      ),
    amount: z
      .number()
      .min(0.01, {
        message: t("schemas.transaction.amountRequired"),
      })
      .max(100000000000, {
        message: t("schemas.transaction.amountMaxLength"),
      }),
    description: z
      .string()
      .min(1, {
        message: t("schemas.transaction.descriptionRequired"),
      })
      .max(200, {
        message: t("schemas.transaction.descriptionMaxLength"),
      }),
    date: z.date({
      message: t("schemas.transaction.dateRequired"),
    }),
  })
}

export const createCategorySchema = (t: TypedTranslationFunction) => {
  return z.object({
    categoryKey: z.string().optional(), // auto generated
    type: z.enum(TRANSACTION_TYPES, {
      message: t("schemas.category.categoryTypeRequired"),
    }),
    label: z
      .string()
      .min(1, {
        message: t("schemas.category.categoryNameRequired"),
      })
      .max(50, {
        message: t("schemas.category.categoryNameMaxLength"),
      }),
    description: z
      .string()
      .min(1, {
        message: t("schemas.category.categoryDescriptionRequired"),
      })
      .max(200, {
        message: t("schemas.category.categoryDescriptionMaxLength"),
      }),
  })
}

export const createBudgetSchema = (t: TypedTranslationFunction) => {
  return z
    .object({
      categoryKey: z
        .string()
        .min(1, { message: t("schemas.budget.categoryRequired") })
        .refine(
          (val) =>
            (ALL_CATEGORIES_KEY as readonly string[]).includes(val) ||
            val.startsWith("custom_"),
          { message: t("schemas.budget.categoryRequired") }
        ),
      allocatedAmount: z
        .number()
        .min(0.01, {
          message: t("schemas.budget.amountRequired"),
        })
        .max(100000000000, {
          message: t("schemas.budget.amountMaxLength"),
        }),
      startDate: z.date({
        message: t("schemas.budget.startDateRequired"),
      }),
      endDate: z.date({
        message: t("schemas.budget.endDateRequired"),
      }),
    })
    .superRefine((data, ctx) => {
      if (data.endDate <= data.startDate) {
        ctx.addIssue({
          path: ["endDate"],
          message: t("schemas.budget.endDateMustBeAfterStartDate"),
          code: "custom",
        })
      }
    })
}

export const createGoalSchema = (t: TypedTranslationFunction) => {
  return z
    .object({
      name: z
        .string()
        .min(1, {
          message: t("schemas.goal.nameRequired"),
        })
        .max(100, {
          message: t("schemas.goal.nameMaxLength"),
        }),
      categoryKey: z
        .string()
        .min(1, { message: t("schemas.goal.categoryRequired") })
        .refine(
          (val) =>
            (ALL_CATEGORIES_KEY as readonly string[]).includes(val) ||
            val.startsWith("custom_"),
          { message: t("schemas.goal.categoryInvalid") }
        ),
      targetAmount: z
        .number()
        .min(0.01, {
          message: t("schemas.goal.targetAmountRequired"),
        })
        .max(100000000000, {
          message: t("schemas.goal.targetAmountMaxLength"),
        }),
      startDate: z.date({
        message: t("schemas.goal.startDateRequired"),
      }),
      endDate: z.date({
        message: t("schemas.goal.endDateRequired"),
      }),
    })
    .superRefine((data, ctx) => {
      if (data.endDate <= data.startDate) {
        ctx.addIssue({
          path: ["endDate"],
          message: t("schemas.goal.endDateMustBeAfterStartDate"),
          code: "custom",
        })
      }
    })
}

export const createRecurringTransactionSchema = (
  t: TypedTranslationFunction
) => {
  return z
    .object({
      type: z.enum(TRANSACTION_TYPES, {
        message: t("schemas.transaction.transactionTypeRequired"),
      }),
      categoryKey: z
        .string()
        .min(1, { message: t("schemas.transaction.categoryRequired") })
        .refine(
          (val) =>
            (ALL_CATEGORIES_KEY as readonly string[]).includes(val) ||
            val.startsWith("custom_"),
          { message: t("schemas.transaction.categoryRequired") }
        ),
      amount: z
        .number()
        .min(0.01, {
          message: t("schemas.transaction.amountRequired"),
        })
        .max(100000000000, {
          message: t("schemas.transaction.amountMaxLength"),
        }),
      description: z
        .string()
        .min(1, {
          message: t("schemas.transaction.descriptionRequired"),
        })
        .max(200, {
          message: t("schemas.transaction.descriptionMaxLength"),
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
          message: t("schemas.recurring.frequencyRequired"),
        }
      ),
      randomEveryXDays: z
        .number()
        .min(1, {
          message: t("schemas.recurring.randomEveryXDaysRequired"),
        })
        .max(365, {
          message: t("schemas.recurring.randomEveryXDaysMax"),
        })
        .optional(),
      startDate: z.date({
        message: t("schemas.recurring.startDateRequired"),
      }),
      endDate: z.date().optional(),
      lastGenerated: z.date().optional(), // auto generated
      isActive: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
          path: ["endDate"],
          message: t("schemas.recurring.endDateMustBeAfterStartDate"),
          code: "custom",
        })
      }

      if (data.frequency === "random" && data.randomEveryXDays === undefined) {
        ctx.addIssue({
          path: ["randomEveryXDays"],
          message: t("schemas.recurring.randomEveryXDaysRequired"),
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
          message: t("schemas.recurring.cannotActivateExpiredRecurring"),
          code: "custom",
        })
      }
    })
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordSchema>
>
export type NameFormValues = z.infer<ReturnType<typeof createNameSchema>>
export type UsernameFormValues = z.infer<
  ReturnType<typeof createUsernameSchema>
>
export type TransactionFormValues = z.infer<
  ReturnType<typeof createTransactionSchema>
>
export type CategoryFormValues = z.infer<
  ReturnType<typeof createCategorySchema>
>
export type BudgetFormValues = z.infer<ReturnType<typeof createBudgetSchema>>
export type GoalFormValues = z.infer<ReturnType<typeof createGoalSchema>>
export type RecurringTransactionFormValues = z.infer<
  ReturnType<typeof createRecurringTransactionSchema>
>
export type TwoFactorPasswordFormValues = z.infer<
  ReturnType<typeof createTwoFactorPasswordSchema>
>
export type TwoFactorCodeFormValues = z.infer<
  ReturnType<typeof createTwoFactorCodeSchema>
>
