import { z } from "zod"

import type { TypedTranslationFunction } from "@/i18n/types"
import { ALL_CATEGORIES_KEY, TRANSACTION_TYPES } from "@/lib/categories"

export const createSignInSchema = (t: TypedTranslationFunction) => {
  const basePasswordSchema = z
    .string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: t("schemas.signIn.passwordRequired"),
    })

  return z.object({
    username: z
      .string()
      .min(1, { message: t("schemas.signIn.usernameRequired") }),
    password: basePasswordSchema,
  })
}

export const createPasswordSchema = (t: TypedTranslationFunction) => {
  const basePasswordSchema = z
    .string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: t("schemas.password.newPasswordRequired"),
    })

  return z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const { currentPassword, newPassword, confirmPassword } = data

      const isChangingPassword =
        currentPassword || newPassword || confirmPassword

      if (isChangingPassword) {
        if (!currentPassword) {
          ctx.addIssue({
            path: ["currentPassword"],
            message: t("schemas.password.currentPasswordRequired"),
            code: "custom",
          })
        }

        if (
          !newPassword ||
          !basePasswordSchema.safeParse(newPassword).success
        ) {
          ctx.addIssue({
            path: ["newPassword"],
            message: t("schemas.password.newPasswordRequired"),
            code: "custom",
          })
        }

        if (!confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            message: t("schemas.password.confirmPasswordRequired"),
            code: "custom",
          })
        } else if (newPassword !== confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            message: t("schemas.password.passwordsNotMatch"),
            code: "custom",
          })
        }
      }
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
    categoryKey: z.string().optional(),
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
      amount: z
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
      targetAmount: z
        .number()
        .min(0.01, {
          message: t("schemas.goal.targetAmountRequired"),
        })
        .max(100000000000, {
          message: t("schemas.goal.targetAmountMaxLength"),
        }),
      currentAmount: z
        .number()
        .min(0, {
          message: t("schemas.goal.currentAmountRequired"),
        })
        .max(100000000000, {
          message: t("schemas.goal.currentAmountMaxLength"),
        }),
      deadline: z.date({
        message: t("schemas.goal.deadlineRequired"),
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
    })
    .superRefine((data, ctx) => {
      if (data.currentAmount > data.targetAmount) {
        ctx.addIssue({
          path: ["currentAmount"],
          message: t("schemas.goal.currentAmountExceedsTarget"),
          code: "custom",
        })
      }
    })
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordSchema>
>
export type TransactionFormValues = z.infer<
  ReturnType<typeof createTransactionSchema>
>
export type CategoryFormValues = z.infer<
  ReturnType<typeof createCategorySchema>
>
export type BudgetFormValues = z.infer<ReturnType<typeof createBudgetSchema>>
export type GoalFormValues = z.infer<ReturnType<typeof createGoalSchema>>
