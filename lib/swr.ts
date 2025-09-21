import useSWR from "swr"

import { me } from "@/actions/auth"
import type { User } from "@/lib/definitions"

export function useUser() {
  const { data, isLoading, mutate } = useSWR<
    | {
        error: string
        user?: undefined
      }
    | {
        user: User
        error?: undefined
      }
  >("me", me, {
    keepPreviousData: true,
  })

  const userResponse = data
  const user = data?.user
  const isUserError = data?.error
  const isUserLoading = isLoading

  return {
    userResponse,
    user,
    isUserLoading,
    isUserError,
    mutate,
  }
}
