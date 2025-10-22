"use server"

import { passwordSchema, type PasswordFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

import { getUserCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updatePassword(values: PasswordFormValues) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const parsedValues = passwordSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Dữ liệu không hợp lệ!" }
    }

    const { currentPassword, newPassword } = parsedValues.data

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: "Không tìm thấy người dùng!" }
    }

    let hashedPassword: string

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      )

      if (!isPasswordValid) {
        return { error: "Mật khẩu hiện tại không đúng!" }
      }

      hashedPassword = await bcrypt.hash(newPassword, 10)
    } else {
      hashedPassword = existingUser.password
    }

    const isSame = hashedPassword === existingUser.password

    if (isSame) {
      return { success: "Không có thay đổi nào được thực hiện." }
    }

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      }
    )

    return { success: "Mật khẩu của bạn đã được thay đổi." }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error: "Cập nhật mật khẩu thất bại! Vui lòng thử lại sau." }
  }
}
