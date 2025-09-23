import { z } from "zod"

const basePasswordSchema = z
  .string()
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      "Password must be at least 8 characters long, include uppercase, lowercase, number and special character.",
  })

const signInSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
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
          message: "Current password is required.",
          code: "custom",
        })
      }

      if (!newPassword || !basePasswordSchema.safeParse(newPassword).success) {
        ctx.addIssue({
          path: ["newPassword"],
          message:
            "Password must be at least 8 characters long, include uppercase, lowercase, number and special character.",
          code: "custom",
        })
      }

      if (!confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Please confirm your new password.",
          code: "custom",
        })
      } else if (newPassword !== confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Passwords do not match.",
          code: "custom",
        })
      }
    }
  })

export { signInSchema, passwordSchema }
