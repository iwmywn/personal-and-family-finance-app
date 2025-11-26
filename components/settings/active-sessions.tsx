"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Laptop, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
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

export function ActiveSessions() {
  const t = useTranslations()
  const router = useRouter()
  const { activeSessions, currentSession } = useAppData()
  const [isTerminating, setIsTerminating] = useState<string | undefined>()
  const [isRevokingAll, setIsRevokingAll] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [locations, setLocations] = useState<Record<string, string | null>>({})

  const sortedSessions = activeSessions
    .filter((session) => session.userAgent)
    .sort((a, b) => {
      const aIsCurrent = a.id === currentSession.session.id
      const bIsCurrent = b.id === currentSession.session.id
      if (aIsCurrent === bIsCurrent) return 0
      return aIsCurrent ? -1 : 1
    })

  useEffect(() => {
    if (open && sortedSessions.length > 0) {
      const fetchLocations = async () => {
        const locationPromises = sortedSessions.map(async (session) => {
          const location = await getLocationFromIP(session.ipAddress)
          return { id: session.id, location: location || null }
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
          toast.error(t("settings.be.sessionRevokeFailed"))
        },
        onSuccess: () => {
          toast.success(t("settings.be.sessionRevoked"))
          setTimeout(() => router.refresh(), 1000)
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
          toast.error(t("settings.be.sessionsRevokeAllFailed"))
        },
        onSuccess: () => {
          toast.success(t("settings.be.sessionsRevokedAll"))
          setTimeout(() => router.refresh(), 1000)
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
        <Button variant="outline">{t("settings.fe.viewActiveSessions")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.fe.activeSessions")}</DialogTitle>
          <DialogDescription>
            {t("settings.fe.activeSessionsDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {sortedSessions.map((session) => {
            const parser = new UAParser(session.userAgent || "")
            const device = parser.getDevice()
            const os = parser.getOS()
            const browser = parser.getBrowser()
            const isCurrentSession = session.id === currentSession.session.id
            const location =
              locations[session.id] ?? t("settings.fe.unknownLocation")

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
                    {os.name || session.userAgent}
                    {browser.name && `, ${browser.name}`}
                    {isCurrentSession && (
                      <span className="text-green-500">
                        {t("settings.fe.current")}
                      </span>
                    )}
                  </ItemTitle>
                  <ItemDescription>{location}</ItemDescription>
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
                    {t("settings.fe.terminate")}
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
          {isRevokingAll && <Spinner />} {t("settings.fe.terminateAll")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
