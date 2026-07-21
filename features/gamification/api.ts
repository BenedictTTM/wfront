// features/gamification/api.ts — XP, achievements, leaderboards, challenges, energy & dashboard API calls

import { apiGet, apiPost } from "@/lib/api-client";
import {
  Achievement,
  Challenge,
  LeaderboardResponse,
  UserDashboard,
  UserEnergy,
  UserStreak,
} from "./types";

export async function getDashboard(): Promise<UserDashboard> {
  return apiGet<UserDashboard>("/users/me/dashboard");
}

export async function getEnergy(): Promise<UserEnergy> {
  return apiGet<UserEnergy>("/users/me/energy");
}

export async function getStreak(): Promise<UserStreak> {
  return apiGet<UserStreak>("/users/me/streak");
}

export async function refillEnergy(): Promise<UserEnergy> {
  return apiPost<UserEnergy>("/users/me/refill-energy");
}

export async function getChallenges(): Promise<Challenge[]> {
  return apiGet<Challenge[]>("/challenges/active");
}

export async function getAchievements(): Promise<Achievement[]> {
  const res = await apiGet<{ data: Achievement[] }>("/users/me/achievements");
  return res.data || [];
}

export async function getLeaderboard(params?: {
  scope?: "global" | "subject";
  subjectId?: string;
  week?: string;
}): Promise<LeaderboardResponse> {
  const query = new URLSearchParams();
  if (params?.scope) query.set("scope", params.scope);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.week) query.set("week", params.week);

  const queryString = query.toString();
  return apiGet<LeaderboardResponse>(
    `/leaderboards${queryString ? `?${queryString}` : ""}`
  );
}
