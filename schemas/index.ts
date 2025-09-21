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

export { signInSchema }
