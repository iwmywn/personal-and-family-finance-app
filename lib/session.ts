import { cache } from "react"
import { cookies } from "next/headers"
import { getIronSession, SessionOptions } from "iron-session"

interface UserSession {
  userId: string
  expires: Date
}

const sevenDays = 7 * 24 * 60 * 60

const sessionOptions = {
  user: {
    password: process.env.SESSION_SECRET!,
    cookieName: "user_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: sevenDays,
    },
  },
} as const

async function getSession<T extends object>(options: SessionOptions) {
  return await getIronSession<T>(await cookies(), options)
}

const session = {
  user: {
    get: cache(async () => getSession<UserSession>(sessionOptions.user)),
    create: async (userId: string) => {
      const s = await session.user.get()
      s.userId = userId
      s.expires = new Date(Date.now() + sevenDays * 1000)
      await s.save()
    },
    update: async () => {
      const s = await session.user.get()
      s.expires = new Date(Date.now() + sevenDays * 1000)
      s.updateConfig(sessionOptions.user)
      await s.save()
    },
    delete: async () => {
      const s = await session.user.get()
      s.destroy()
    },
  },
}

export { session }
