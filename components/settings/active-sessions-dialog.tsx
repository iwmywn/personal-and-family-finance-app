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
import { useAppData } from "@/context/app-data-context"
import { client } from "@/lib/auth-client"

export function ActiveSessionsDialog() {
  const t = useExtracted()
  const router = useRouter()
  const { activeSessions, currentSession } = useAppData()
  const [isTerminating, setIsTerminating] = useState<string | undefined>()
  const [isRevokingAll, setIsRevokingAll] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [locations, setLocations] = useState<Record<string, string | null>>({})

  const sortedSessions = activeSessions
    .filter((session) => session.userAgent)
    .sort((a, b) => {
      const aIsCurrent = a.id === currentSession.id
      const bIsCurrent = b.id === currentSession.id
      if (aIsCurrent === bIsCurrent) return 0
      return aIsCurrent ? -1 : 1
    })

  useEffect(() => {
    if (open && sortedSessions.length > 0) {
      const fetchLocations = async () => {
        const locationPromises = sortedSessions.map(async (session) => {
          const location = await getLocationFromIP(session.ipAddress)
          return { id: session.id, location: location }
        })

        const results = await Promise.all(locationPromises)
        const locationMap: Record<string, string | null> = {}
        results.forEach(({ id, location }) => {
          locationMap[id] = location
        })
        setLocations(locationMap)
      }

      fetchLocations()
    }
  }, [open, sortedSessions])

  async function handleRevokeSession(sessionId: string, token: string) {
    setIsTerminating(sessionId)

    await client.revokeSession({
      token,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to terminate session! Please try again later."))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("Session terminated."))
        },
      },
    })

    setIsTerminating(undefined)
  }

  async function handleRevokeAllSessions() {
    setIsRevokingAll(true)

    await client.revokeSessions({
      fetchOptions: {
        onError: () => {
          toast.error(
            t("Failed to terminate all sessions! Please try again later.")
          )
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("All sessions terminated."))
        },
      },
    })

    setIsRevokingAll(false)
  }

  if (sortedSessions.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    onClick={() =>
                      handleRevokeSession(session.id, session.token)
                    }
                    disabled={isTerminating === session.id || isRevokingAll}
                  >
                    {isTerminating === session.id && <Spinner />}
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
