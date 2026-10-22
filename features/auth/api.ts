// features/auth/api.ts — typed API calls for auth endpoints
// All calls go through the Next.js Route Handler proxies so httpOnly cookies
// are never exposed to client-side JavaScript.

import { apiGet, apiPost, apiPatch, ApiError } from "@/lib/api-client";
import type { MeResponse } from "./types";
import { isGuestIdentity } from "./types";
import { safeStorage } from "@/lib/storage";

export const AUTH_STORAGE_KEY = "auth_user";

// ── /me ───────────────────────────────────────────────────────────────────────

/** Fetch the current user (or guest identity) from the secure Next.js proxy. Returns null when unauthenticated. */
export async function fetchCurrentUser(): Promise<MeResponse | null> {
  try {
    const data = await apiGet<MeResponse>("/api/users/me");
    if (data && !isGuestIdentity(data)) {
      safeStorage.setItem(AUTH_STORAGE_KEY, data);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      safeStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    throw err;
  }
}

// ── Auth mutations ────────────────────────────────────────────────────────────

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{ user?: MeResponse }> {
  const res = await apiPost<{ user?: MeResponse }>("/api/auth/login", credentials);
  if (res?.user && !isGuestIdentity(res.user)) {
    safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
  }
  return res;
}

export async function registerUser(data: {
  email: string;
  password: string;
}): Promise<{ user?: MeResponse }> {
  const res = await apiPost<{ user?: MeResponse }>("/api/auth/register", data);
  if (res?.user && !isGuestIdentity(res.user)) {
    safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
  }
  return res;
}

export async function loginWithGoogle(data: {
  idToken: string;
}): Promise<{ user?: MeResponse }> {
  const res = await apiPost<{ user?: MeResponse }>("/api/auth/google", data);
  if (res?.user && !isGuestIdentity(res.user)) {
    safeStorage.setItem(AUTH_STORAGE_KEY, res.user);
  }
  return res;
}

export async function requestPasswordReset(data: { email: string }): Promise<void> {
  await apiPost<void>("/api/auth/request-password-reset", data);
}

export async function logoutUser(): Promise<void> {
  safeStorage.removeItem(AUTH_STORAGE_KEY);
  try {
    await apiPost<void>("/api/auth/logout");
  } catch {
    // Best-effort — the proxy always clears cookies even on failure
    console.warn("[auth] logout request failed, cookies may still be cleared");
  }
}

/** Fetches the active auth token for WebSocket connections. */
export async function fetchAuthToken(): Promise<string> {
  const data = await apiGet<{ token: string }>("/api/auth/token");
  if (!data?.token) {
    throw new Error("Failed to fetch auth token");
  }
  return data.token;
}

// ── User profile & School integrations ──────────────────────────────────────

export interface UpdateUserProfilePayload {
  name?: string;
  schoolId?: string | null;
  avatarUrl?: string | null;
}

/** Updates user profile fields via PATCH /api/users/me */
export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<MeResponse> {
  const updated = await apiPatch<MeResponse>("/api/users/me", payload);
  if (updated && !isGuestIdentity(updated)) {
    safeStorage.setItem(AUTH_STORAGE_KEY, updated);
  }
  return updated;
}

export interface SchoolsResponse {
  schools: Array<{
    id: string;
    name: string;
    shortCode: string;
    slug: string;
    region?: string | null;
    crestUrl?: string | null;
    motto?: string | null;
    turfScore?: number;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Fetch Ghanaian SHS schools with search & regional filtering */
export async function fetchSchools(params?: {
  search?: string;
  region?: string;
  limit?: number;
  page?: number;
}): Promise<SchoolsResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.region && params.region !== "All Regions") sp.set("region", params.region);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.page) sp.set("page", String(params.page));

  const queryStr = sp.toString();
  const endpoint = queryStr ? `/api/schools?${queryStr}` : "/api/schools";
  return apiGet<SchoolsResponse>(endpoint);
}

export interface AvatarUploadConfig {
  provider: string;
  uploadUrl: string;
  cdnUrl: string;
  uploadParams?: {
    api_key: string;
    timestamp: number;
    public_id: string;
    signature: string;
  };
}

/** Generate Cloudinary signed avatar upload parameters via POST /users/me/avatar-upload-url */
export async function fetchAvatarUploadConfig(): Promise<AvatarUploadConfig> {
  return apiPost<AvatarUploadConfig>("/api/users/me/avatar-upload-url");
}

/**
 * Uploads student avatar directly to Cloudinary using pre-signed upload parameters
 * from POST /users/me/avatar-upload-url, then binds the CDN URL to user profile.
 */
export async function uploadAvatarViaPresignedUrl(file: File | Blob): Promise<string> {
  // 1. Obtain signed upload credentials strictly via POST /users/me/avatar-upload-url
  const config = await fetchAvatarUploadConfig();

  // 2. Build multipart payload for direct Cloudinary ingestion
  const formData = new FormData();
  formData.append("file", file);
  if (config.uploadParams) {
    formData.append("api_key", config.uploadParams.api_key);
    formData.append("timestamp", String(config.uploadParams.timestamp));
    formData.append("public_id", config.uploadParams.public_id);
    formData.append("signature", config.uploadParams.signature);
  }

  // 3. Direct client-to-Cloudinary upload
  let targetUrl = config.cdnUrl;
  try {
    const res = await fetch(config.uploadUrl, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      targetUrl = data.secure_url || config.cdnUrl;
    } else {
      console.warn("[storage] Cloudinary direct upload returned non-200. Using generated CDN URL.");
    }
  } catch (err) {
    console.warn("[storage] Cloudinary direct network dispatch notice:", err);
  }

  // 4. Bind resolved CDN URL to the student's profile
  await updateUserProfile({ avatarUrl: targetUrl });
  return targetUrl;
}

