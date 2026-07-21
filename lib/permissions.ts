// lib/permissions.ts — role/entitlement guard helpers
// Two distinct 403 codes per architecture doc §4; never collapse into one "you can't do this".
// Used by: middleware.ts (route-level), usePermission() hook (component-level)

import { useCurrentUser } from "@/features/auth/hooks";

export type Role =
  | "STUDENT"
  | "TEACHER"
  | "SCHOOL_ADMIN"
  | "CONTENT_DEVELOPER"
  | "ADMIN";

export type Permission =
  | "content:view"
  | "content:create"
  | "content:manage"
  | "content:publish"
  | "admin:audit"
  | "admin:schools"
  | "admin:users";
// TODO: confirm complete permission list against real RBAC table (Phase 5)

export type GuardResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" }      // → redirect to /login
  | { ok: false; reason: "permission_denied" }     // → hide feature entirely
  | { ok: false; reason: "entitlement_required" }; // → show paywall/upsell UI

// TODO: populate once real RBAC table is confirmed (architecture doc §4 ⚠️ TODO)
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STUDENT: ["content:view"],
  TEACHER: ["content:view", "content:create", "content:manage"],
  SCHOOL_ADMIN: ["content:view"],
  CONTENT_DEVELOPER: ["content:view", "content:create", "content:manage", "content:publish"],
  ADMIN: ["content:view", "content:create", "content:manage", "content:publish", "admin:audit", "admin:schools", "admin:users"],
};

/**
 * Checks whether a role has a given permission.
 */
export function hasPermission(role: Role | undefined, permission: Permission): GuardResult {
  if (!role) return { ok: false, reason: "unauthenticated" };
  if (ROLE_PERMISSIONS[role]?.includes(permission)) return { ok: true };
  return { ok: false, reason: "permission_denied" };
}

/**
 * usePermission — client-side hook wrapping hasPermission for component-level guards.
 * Reads current user from auth context
 */
export function usePermission(permission: Permission): GuardResult {
  const user = useCurrentUser();
  if (!user) return { ok: false, reason: "unauthenticated" };
  return hasPermission(user.role as Role, permission);
}
