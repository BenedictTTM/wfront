// features/auth/types.ts — canonical client-side auth types
// Shape derived from NestJS UserResponseDto and GuestMeResponseDto

export type UserRole =
  | "STUDENT"
  | "TEACHER"
  | "SCHOOL_ADMIN"
  | "CONTENT_DEVELOPER"
  | "ADMIN";

/** Authenticated user profile returned by GET /api/users/me */
export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  entitlementActive: boolean;
  createdAt: string; // ISO-8601 string (serialised Date)
  name?: string | null;
};

/** Guest identity view returned by GET /api/users/me when caller is a guest */
export type GuestIdentity = {
  isGuest: true;
  sessionId: string;
  deviceId: string;
  createdAt: string; // ISO-8601 string (serialised Date)
};

/** Union of everything GET /api/users/me can return */
export type MeResponse = AuthUser | GuestIdentity;

export function isGuestIdentity(me: MeResponse): me is GuestIdentity {
  return "isGuest" in me && me.isGuest === true;
}
