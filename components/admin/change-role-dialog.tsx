"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useExtracted } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormButton,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchemas } from "@/hooks/use-schemas"
import { authClient } from "@/lib/auth-client"
import type { User } from "@/lib/definitions"
import type { AssignableRole } from "@/lib/role"
import type { AdminRoleFormValues } from "@/schemas/types"

interface ChangeRoleDialogProps {
  user: User
  open: boolean
  setOpen: (open: boolean) => void
}

export function ChangeRoleDialog({
  user,
  open,
  setOpen,
}: ChangeRoleDialogProps) {
  const t = useExtracted()
  const { createAdminRoleSchema } = useSchemas()
  const router = useRouter()
  const form = useForm<AdminRoleFormValues>({
    resolver: zodResolver(createAdminRoleSchema()),
    defaultValues: {
      role: user.role as AssignableRole,
    },
  })

  async function onSubmit(values: AdminRoleFormValues) {
    await authClient.admin.updateUser({
      userId: user.id,
      data: {
        role: values.role,
      },
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to update user role! Please try again later."))
        },
        onSuccess: () => {
          setOpen(false)
          toast.success(t("User role has been updated."))
          router.refresh()
          form.reset()
        },
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Change User Role")}</DialogTitle>
          <DialogDescription>
            {t("Assign a new system role to")} <strong>{user.name}</strong> (
            {user.email}).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="form-role">{t("Role")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="form-role" className="w-full">
                        <SelectValue placeholder={t("Select role")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">{t("User")}</SelectItem>
                      <SelectItem value="admin">{t("Admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("Cancel")}</Button>
              </DialogClose>
              <FormButton isSubmitting={form.formState.isSubmitting}>
                {t("Save")}
              </FormButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
