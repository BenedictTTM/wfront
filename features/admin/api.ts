// features/admin/api — audit logs, schools, users management API calls
// All require Admin role; admin:audit, admin:schools, admin:users permissions
// TODO: implement
export async function getAuditLogs(_params: unknown): Promise<void> { /* TODO: cursor-paginated */ }
export async function getSchools(): Promise<void> { /* TODO: cursor-paginated */ }
export async function getAdminUsers(): Promise<void> { /* TODO: cursor-paginated */ }
export async function updateUserRole(_userId: string, _role: string): Promise<void> { /* TODO */ }
