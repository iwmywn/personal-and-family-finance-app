export const ROLES = ["user", "admin", "superadmin"] as const
export type UserRole = (typeof ROLES)[number]

export const ADMIN_ROLES = ["admin", "superadmin"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ASSIGNABLE_ROLES = ["user", "admin"] as const
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

export const DEFAULT_ROLE: AssignableRole = "user"

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "superadmin"
}

export function isSuperAdminRole(role: string): boolean {
  return role === "superadmin"
}
