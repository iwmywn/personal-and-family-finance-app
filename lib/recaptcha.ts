"use server"

import { env } from "@/env/server"

export async function verifyRecaptchaToken(token: string) {
  if (!token) return false

  const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${env.RECAPTCHA_SECRET}&response=${token}`,
  })

  if (!res.ok) {
    return false
  } else {
    const captchaData = await res.json()
    return captchaData.success
  }
}
