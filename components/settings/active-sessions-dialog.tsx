"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Laptop, Smartphone } from "lucide-react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"
import { UAParser } from "ua-parser-js"

import { getLocationFromIP } from "@/actions/location.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { useUser } from "@/context/user-context"
import { authClient } from "@/lib/auth-client"

export function ActiveSessionsDialog() {
  const t = useExtracted()
  const router = useRouter()
  const { session: currentSession, activeSessions } = useUser()
  const [isTerminating, setIsTerminating] = useState<string | undefined>()
  const [isRevokingAll, setIsRevokingAll] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [locations, setLocations] = useState<Record<string, string | null>>({})

  const allSessions = activeSessions.some((s) => s.id === currentSession.id)
    ? activeSessions
    : [currentSession, ...activeSessions]

  const sortedSessions = allSessions
    .filter((session) => session.userAgent)
    .sort((a, b) => {
      const aIsCurrent = a.id === currentSession.id
      const bIsCurrent = b.id === currentSession.id
      if (aIsCurrent === bIsCurrent) return 0
      return aIsCurrent ? -1 : 1
    })

  useEffect(() => {
    let isCancelled = false

    if (isOpen && sortedSessions.length > 0) {
      const fetchLocations = async () => {
        const locationPromises = sortedSessions.map(async (session) => {
          const location = await getLocationFromIP(session.ipAddress)
          return { id: session.id, location: location }
        })

        const results = await Promise.all(locationPromises)
        if (!isCancelled) {
          const locationMap: Record<string, string | null> = {}
          results.forEach(({ id, location }) => {
            locationMap[id] = location
          })
          setLocations(locationMap)
        }
      }

      fetchLocations()
    }

    return () => {
      isCancelled = true
    }
  }, [isOpen, sortedSessions])

  async function handleRevokeSession(token: string) {
    setIsTerminating(token)

    if (token === currentSession.token && currentSession.impersonatedBy) {
      toast.promise(authClient.admin.stopImpersonating(), {
        loading: t("Stopping impersonation..."),
        success: () => {
          router.push("/admin")
          router.refresh()
          return t("Stopped impersonation session.")
        },
        error: () => t("Failed to stop impersonating! Please try again later."),
      })
      setIsTerminating(undefined)
      return
    }

    await authClient.revokeSession({
      token,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to terminate session! Please try again later."))
        },
        onSuccess: () => {
          toast.success(t("Session terminated."))
          router.refresh()
        },
      },
    })

    setIsTerminating(undefined)
  }

  async function handleRevokeAllSessions() {
    setIsRevokingAll(true)

    if (currentSession.impersonatedBy) {
      await authClient.revokeOtherSessions({
        fetchOptions: {
          onError: () => {
            toast.error(
              t("Failed to terminate all sessions! Please try again later.")
            )
          },
        },
      })

      toast.promise(authClient.admin.stopImpersonating(), {
        loading: t("Stopping impersonation..."),
        success: () => {
          router.push("/admin")
          router.refresh()
          return t("All sessions terminated.")
        },
        error: () => t("Failed to stop impersonating! Please try again later."),
      })

      setIsRevokingAll(false)
      return
    }

    await authClient.revokeSessions({
      fetchOptions: {
        onError: () => {
          toast.error(
            t("Failed to terminate all sessions! Please try again later.")
          )
        },
        onSuccess: () => {
          toast.success(t("All sessions terminated."))
          router.refresh()
        },
      },
    })

    setIsRevokingAll(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("View Active Sessions")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Active Sessions")}</DialogTitle>
          <DialogDescription>
            {t("Manage your active sessions.")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {sortedSessions.map((session) => {
            const parser = new UAParser(session.userAgent || "")
            const device = parser.getDevice()
            const os = parser.getOS()
            const browser = parser.getBrowser()
            const isCurrentSession = session.id === currentSession.id
            const location = locations[session.id]

            return (
              <Item key={session.id} variant="outline">
                <ItemMedia variant="icon">
                  {device.type === "mobile" ? (
                    <Smartphone className="text-muted-foreground h-5 w-5" />
                  ) : (
                    <Laptop className="text-muted-foreground h-5 w-5" />
                  )}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <div>
                      {os.name || session.userAgent}
                      {browser.name && `, ${browser.name}`}
                    </div>
                    {isCurrentSession && (
                      <>
                        <div>&middot;</div>
                        <div className="text-green-500">{t("Current")}</div>
                      </>
                    )}
                  </ItemTitle>
                  <ItemDescription>
                    {location === undefined ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      (location ?? t("Unknown Location"))
                    )}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.token)}
                    disabled={isTerminating === session.token || isRevokingAll}
                  >
                    {isTerminating === session.token && <Spinner />}
                    {t("Terminate")}
                  </Button>
                </ItemActions>
              </Item>
            )
          })}
        </div>
        <Button
          onClick={handleRevokeAllSessions}
          disabled={isRevokingAll || isTerminating !== undefined}
        >
          {isRevokingAll && <Spinner />} {t("Terminate All")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
