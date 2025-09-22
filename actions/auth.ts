"use server"

import { signInSchema } from "@/schemas"
import bcrypt from "bcryptjs"

import type { SignInFormValues } from "@/components/auth/signin-form"
import { getUserById, getUserByUsername } from "@/lib/data"
import { User } from "@/lib/definitions"
import { verifyRecaptchaToken } from "@/lib/recaptcha"
import { session } from "@/lib/session"

export async function signIn(
  values: SignInFormValues,
  recaptchaToken: string | null
) {
  try {
    if (!recaptchaToken) return { error: "Missing recaptcha token!" }

    const parsedValues = signInSchema.safeParse(values)

    if (!parsedValues.success) return { error: "Invalid data provided!" }

    const { username, password } = parsedValues.data
    const [verify, existingUser] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUserByUsername(username),
    ])

    if (!verify) return { error: "Captcha challenge failed!" }
    if (!existingUser) return { error: "Username or password is incorrect!" }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) return { error: "Username or password is incorrect!" }

    await session.user.create(existingUser._id.toString())

    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)
    return { error: "Failed to sign in! Please try again later." }
  }
}

export async function signOut() {
  try {
    await session.user.delete()
    return { success: "You need to sign back in.", error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    return { error: "Failed to sign out! Please try again later." }
  }
}

export async function me() {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return { error: "Unauthorized! Please reload the page and try again." }
    }

    const existingUser = await getUserById(userId)

    if (!existingUser) return { error: "User not found!" }

    const user = { ...existingUser, _id: existingUser._id.toString() } as User

    return { user }
  } catch (error) {
    console.error("Error fetching me: ", error)
    return { error: "Failed to fetch me! Please try again later." }
  }
}
