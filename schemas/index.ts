import type { TypedTranslationFunction } from "@/i18n/types"
import { z } from "zod"

import { ALL_CATEGORIES_KEY, TRANSACTION_TYPES } from "@/lib/categories"

export const createSignInSchema = (
  t: TypedTranslationFunction<"schemas.signIn">
) => {
  const basePasswordSchema = z
    .string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: t("passwordRequired"),
    })

  return z.object({
    username: z.string().min(1, { message: t("usernameRequired") }),
    password: basePasswordSchema,
  })
}

export const createPasswordSchema = (
  t: TypedTranslationFunction<"schemas.password">
) => {
  const basePasswordSchema = z
    .string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: t("newPasswordRequired"),
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
            message: t("currentPasswordRequired"),
            code: "custom",
          })
        }

        if (
          !newPassword ||
          !basePasswordSchema.safeParse(newPassword).success
        ) {
          ctx.addIssue({
            path: ["newPassword"],
            message: t("newPasswordRequired"),
            code: "custom",
          })
        }

        if (!confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            message: t("confirmPasswordRequired"),
            code: "custom",
          })
        } else if (newPassword !== confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            message: t("passwordsNotMatch"),
            code: "custom",
          })
        }
      }
    })
}

export const createTransactionSchema = (
  t: TypedTranslationFunction<"schemas.transaction">
) => {
  return z.object({
    type: z.enum(TRANSACTION_TYPES, {
      message: t("transactionTypeRequired"),
    }),
    categoryKey: z
      .string()
      .min(1, { message: t("categoryRequired") })
      .refine(
        (val) =>
          (ALL_CATEGORIES_KEY as readonly string[]).includes(val) ||
          val.startsWith("custom_"),
        { message: t("categoryRequired") }
      ),
    amount: z
      .number()
      .min(0.01, {
        message: t("amountRequired"),
      })
      .max(100000000000, {
        message: t("amountMaxLength"),
      }),
    description: z
      .string()
      .min(1, {
        message: t("descriptionRequired"),
      })
      .max(200, {
        message: t("descriptionMaxLength"),
      }),
    date: z.date({
      message: t("dateRequired"),
    }),
  })
}

export const createCategorySchema = (
  t: TypedTranslationFunction<"schemas.category">
) => {
  return z.object({
    categoryKey: z.string().optional(),
    type: z.enum(TRANSACTION_TYPES, {
      message: t("categoryTypeRequired"),
    }),
    label: z
      .string()
      .min(1, {
        message: t("categoryNameRequired"),
      })
      .max(50, {
        message: t("categoryNameMaxLength"),
      }),
    description: z
      .string()
      .min(1, {
        message: t("categoryDescriptionRequired"),
      })
      .max(200, {
        message: t("categoryDescriptionMaxLength"),
      }),
  })
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordSchema>
>
export type TransactionFormValues = z.infer<
  ReturnType<typeof createTransactionSchema>
>
export type CustomCategoryFormValues = z.infer<
  ReturnType<typeof createCategorySchema>
>
