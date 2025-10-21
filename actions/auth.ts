"use server"

import { signInSchema, type SignInFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

import { getUserCollection } from "@/lib/collections"
import { User } from "@/lib/definitions"
import { verifyRecaptchaToken } from "@/lib/recaptcha"
import { session } from "@/lib/session"

export async function signIn(
  values: SignInFormValues,
  recaptchaToken: string | null
) {
  try {
    if (!recaptchaToken) return { error: "Thiếu token recaptcha!" }

    const parsedValues = signInSchema.safeParse(values)

    if (!parsedValues.success) return { error: "Dữ liệu không hợp lệ!" }

    const { username, password } = parsedValues.data
    const [verify, userCollection] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUserCollection(),
    ])
    const existingUser = await userCollection.findOne({ username })

    if (!verify) return { error: "Xác thực Captcha thất bại!" }
    if (!existingUser)
      return { error: "Tên người dùng hoặc mật khẩu không đúng!" }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid)
      return { error: "Tên người dùng hoặc mật khẩu không đúng!" }

    await session.user.create(existingUser._id.toString())

    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)
    return { error: "Đăng nhập thất bại! Vui lòng thử lại sau." }
  }
}

export async function signOut() {
  try {
    await session.user.delete()
    return { success: "Bạn cần đăng nhập lại.", error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    return { error: "Đăng xuất thất bại! Vui lòng thử lại sau." }
  }
}

export async function getUser() {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) return { error: "Không tìm thấy người dùng!" }

    const user = { ...existingUser, _id: existingUser._id.toString() } as User

    return { user }
  } catch (error) {
    console.error("Error fetching user: ", error)
    return {
      error: "Không thể tải thông tin người dùng! Vui lòng thử lại sau.",
    }
  }
}
