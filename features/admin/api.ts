// features/admin/api — audit logs, schools, users management API calls
// All require Admin role; admin:audit, admin:schools, admin:users permissions

import type { UserRole } from "@/features/auth/types";
import type { AdminUser, AuditLog, AuditLogParams, School } from "./types";

export async function getAuditLogs(_params?: AuditLogParams): Promise<AuditLog[]> {
  /* TODO: cursor-paginated */
  return [];
}

export async function getSchools(): Promise<School[]> {
  /* TODO: cursor-paginated */
  return [];
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  /* TODO: cursor-paginated */
  return [];
}

export async function updateUserRole(_userId: string, _role: UserRole): Promise<void> {
  /* TODO */
}
