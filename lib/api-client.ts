// lib/api-client.ts — typed fetch wrapper for all NestJS API calls
// Base URL: process.env.NEXT_PUBLIC_API_URL
// - Injects Authorization (Bearer) or X-Guest-Token from cookies (server-side)
// - Parses standard error envelope: { error: { code, message, details } } → typed ApiError
// - On 401: calls /api/auth/refresh proxy once (rotates httpOnly cookies), then retries

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const API_URL = API_BASE;

export type ApiErrorCode =
  | "AUTH_TOKEN_EXPIRED"
  | "AUTH_TOKEN_INVALID"
  | "GUEST_TOKEN_INVALID"
  | "PERMISSION_DENIED"
  | "ENTITLEMENT_REQUIRED"
  | "RESOURCE_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "IDEMPOTENCY_CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  // TODO: add all codes from §8 of the Phase 7 REST API spec
  | string;

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getHeaders(init?: RequestInit): Promise<Headers> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Inject tokens if we are running on the server
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      if (cookieHeader && !headers.has("Cookie")) {
        headers.set("Cookie", cookieHeader);
      }
      const accessToken = cookieStore.get("accessToken")?.value;
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        const guestToken = cookieStore.get("guestToken")?.value;
        if (guestToken) {
          headers.set("X-Guest-Token", guestToken);
        }
      }
    } catch {
      // In case cookies() is called outside of a server context
    }
  }
  return headers;
}

interface RawErrorPayload {
  error?: { code?: string; message?: string; details?: unknown };
  code?: string;
  statusCode?: number;
  message?: string | string[];
  details?: unknown;
}

async function parseError(response: Response): Promise<ApiError> {
  let errorPayload: RawErrorPayload | null = null;
  try {
    errorPayload = (await response.json()) as RawErrorPayload;
  } catch {
    return new ApiError(
      "UNKNOWN_ERROR",
      `HTTP ${response.status}: ${response.statusText}`,
      undefined,
      response.status
    );
  }
  const code =
    errorPayload?.error?.code ||
    errorPayload?.code ||
    String(errorPayload?.statusCode ?? "UNKNOWN_ERROR");
  const message =
    errorPayload?.error?.message ||
    (Array.isArray(errorPayload?.message)
      ? errorPayload.message.join(", ")
      : errorPayload?.message) ||
    "An error occurred";
  const details = errorPayload?.error?.details || errorPayload?.details;
  return new ApiError(code, message, details, response.status);
}

function getRequestUrl(path: string): string {
  if (path.startsWith("/api/")) {
    if (typeof window === "undefined") {
      const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return `${base}${path}`;
    }
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // In the browser, route through the same-origin proxy rewrite so httpOnly cookies are attached
  if (typeof window !== "undefined") {
    return `/api/backend${cleanPath}`;
  }

  return `${API_URL}${cleanPath}`;
}

let activeRefreshPromise: Promise<boolean> | null = null;

/** Calls the Next.js refresh proxy to silently rotate tokens. */
async function silentRefresh(): Promise<boolean> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      // Use the internal Next.js route so the proxy can set the new httpOnly cookies.
      const base =
        typeof window === "undefined"
          ? process.env.NEXTAUTH_URL || "http://localhost:3000"
          : "";
      const res = await fetch(`${base}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  /** Internal — prevents infinite refresh loops. */
  _isRetry = false
): Promise<T> {
  const url = getRequestUrl(path);
  const headers = await getHeaders(init);

  const response = await fetch(url, { credentials: "include", ...init, headers });

  // On 401, attempt one silent token refresh then retry (except for auth endpoints to prevent loops).
  const isAuthRoute = path.startsWith("/api/auth/");
  if (response.status === 401 && !_isRetry && !isAuthRoute) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      return request<T>(path, init, true);
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html") || text.trim().startsWith("<")) {
      throw new ApiError(
        "INVALID_RESPONSE",
        `Expected JSON response from ${path} but received HTML. Verify NEXT_PUBLIC_API_URL points to the backend server.`,
        text.slice(0, 300),
        response.status
      );
    }
    return text as unknown as T;
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "GET" });
}

export async function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "DELETE" });
}


