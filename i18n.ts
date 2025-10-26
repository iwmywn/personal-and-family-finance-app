import { ObjectId } from "mongodb"
import { getRequestConfig } from "next-intl/server"

import { getUserCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export default getRequestConfig(async ({ locale }) => {
  // Priority: User setting -> localStorage -> default 'vi'
  let userLocale = locale || "vi"

  try {
    const { userId } = await session.user.get()
    if (userId) {
      const userCollection = await getUserCollection()
      const user = await userCollection.findOne({ _id: new ObjectId(userId) })
      if (user?.locale) {
        userLocale = user.locale
      }
    }
  } catch (error) {
    console.error("Error getting user locale:", error)
  }

  return {
    locale: userLocale,
    messages: (await import(`./messages/${userLocale}.json`)).default,
  }
})
