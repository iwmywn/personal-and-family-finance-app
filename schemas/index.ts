import { z } from "zod"

import { ALL_CATEGORIES, TRANSACTION_TYPES } from "@/lib/categories"

const basePasswordSchema = z
  .string()
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
  })

const signInSchema = z.object({
  username: z.string().min(1, { message: "Tên người dùng là bắt buộc." }),
  password: basePasswordSchema,
})

const passwordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { currentPassword, newPassword, confirmPassword } = data

    const isChangingPassword = currentPassword || newPassword || confirmPassword

    if (isChangingPassword) {
      if (!currentPassword) {
        ctx.addIssue({
          path: ["currentPassword"],
          message: "Mật khẩu hiện tại là bắt buộc.",
          code: "custom",
        })
      }

      if (!newPassword || !basePasswordSchema.safeParse(newPassword).success) {
        ctx.addIssue({
          path: ["newPassword"],
          message:
            "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
          code: "custom",
        })
      }

      if (!confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Vui lòng xác nhận mật khẩu mới của bạn.",
          code: "custom",
        })
      } else if (newPassword !== confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Mật khẩu không khớp.",
          code: "custom",
        })
      }
    }
  })

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, {
    message: "Vui lòng chọn loại giao dịch.",
  }),
  category: z.enum(ALL_CATEGORIES, {
    message: "Vui lòng chọn danh mục.",
  }),
  amount: z
    .number()
    .min(0.01, {
      message: "Số tiền phải lớn hơn 0.",
    })
    .max(100000000000, {
      message: "Số tiền tối đa là 100 tỉ.",
    }),
  description: z
    .string()
    .min(1, {
      message: "Mô tả là bắt buộc.",
    })
    .max(200, {
      message: "Mô tả tối đa là 200 ký tự.",
    }),
  date: z.date({
    message: "Vui lòng chọn ngày.",
  }),
})

export type SignInFormValues = z.infer<typeof signInSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>
export type TransactionFormValues = z.infer<typeof transactionSchema>

export { signInSchema, passwordSchema }
