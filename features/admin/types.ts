// features/admin — admin-specific data (audit logs, school management, user management)

import type { UserRole } from "@/features/auth/types";

export type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  createdAt: string;
  details?: Record<string, unknown>;
};

export type AuditLogParams = {
  cursor?: string;
  limit?: number;
  actorId?: string;
  action?: string;
};

export type School = {
  id: string;
  name: string;
  region?: string;
  studentCount?: number;
};

export type AdminUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  createdAt: string;
};
