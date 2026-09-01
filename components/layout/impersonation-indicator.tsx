"use client"

import { useRouter } from "next/navigation"
import { ShieldAlertIcon } from "lucide-react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from "@/context/user-context"
import { authClient } from "@/lib/auth-client"

export function ImpersonationIndicator() {
  const t = useExtracted()
  const router = useRouter()
  const userContext = useUser()

  if (!userContext.currentSession.impersonatedBy) {
    return null
  }

  const { user } = userContext

  async function onStopImpersonating() {
    toast.promise(authClient.admin.stopImpersonating(), {
      loading: t("Stopping impersonation..."),
      success: () => {
        router.push("/admin")
        router.refresh()
        return t("Stopped impersonation session.")
      },
      error: () => t("Failed to stop impersonating! Please try again later."),
    })
  }

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative size-8 cursor-pointer text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <ShieldAlertIcon className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-amber-500" />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("Impersonating")} {user.name}
        </TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("Stop impersonating this user?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("You are currently impersonating")}{" "}
            <strong>
              {user.name} ({user.email})
            </strong>
            .{" "}
            {t(
              "Stopping will restore your admin session and redirect you back to the admin panel."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onStopImpersonating}>
            {t("Stop Impersonating")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
