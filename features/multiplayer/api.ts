// features/multiplayer/api.ts

import { apiDelete, apiGet, apiPost, API_URL } from "@/lib/api-client";
import { fetchAuthToken } from "@/features/auth/api";
import { JoinQueuePayload, MatchResult, QueueStatus } from "./types";

export async function joinMatchmakingQueue(
  payload: JoinQueuePayload
): Promise<QueueStatus> {
  return apiPost<QueueStatus>("/multiplayer/queue", payload);
}

export async function leaveMatchmakingQueue(): Promise<void> {
  return apiDelete<void>("/multiplayer/queue");
}

export async function getQueueStatus(): Promise<QueueStatus> {
  return apiGet<QueueStatus>("/multiplayer/queue/status");
}

export async function getMatchResult(matchId: string): Promise<MatchResult> {
  return apiGet<MatchResult>(`/multiplayer/matches/${matchId}`);
}

export async function fetchMultiplayerToken(): Promise<string> {
  return fetchAuthToken();
}

/**
 * Returns the WebSocket URL for the multiplayer gateway.
 * Derives from the REST API base URL (http → ws, https → wss).
 */
export function getMultiplayerWsUrl(): string {
  const base = (API_URL || "http://localhost:4000").replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/multiplayer`;
}
