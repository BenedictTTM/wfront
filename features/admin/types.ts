// features/admin — admin-specific data (audit logs, school management, user management)
// TODO: implement
export type AuditLog = { id: string; actorId: string; action: string; createdAt: string; /* TODO */ };
export type School = { id: string; name: string; /* TODO */ };
export type AdminUser = { id: string; email: string; role: string; /* TODO */ };
