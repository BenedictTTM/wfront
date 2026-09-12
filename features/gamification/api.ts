// features/gamification/api.ts — XP, achievements, leaderboards, challenges, energy & dashboard API calls

import { apiGet, apiPost } from "@/lib/api-client";
import {
  Achievement,
  Challenge,
  ClaimRewardResponse,
  LeaderboardResponse,
  QuestDefinition,
  UserDashboard,
  UserEnergy,
  UserQuest,
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

export async function convertDiamondsToEnergy(diamonds?: number): Promise<UserEnergy> {
  return apiPost<UserEnergy>("/users/me/diamonds-to-energy", { diamonds });
}

export async function getUserQuests(): Promise<UserQuest[]> {
  return apiGet<UserQuest[]>("/users/me/quests");
}

export async function getQuestCatalog(): Promise<QuestDefinition[]> {
  return apiGet<QuestDefinition[]>("/quests/catalog");
}

export async function claimQuestReward(periodId: string): Promise<ClaimRewardResponse> {
  return apiPost<ClaimRewardResponse>(`/users/me/quests/${encodeURIComponent(periodId)}/claim`);
}

// Backward-compatible alias mapping UserQuests to Challenge interface for existing UI widgets
export async function getChallenges(): Promise<Challenge[]> {
  const quests = await getUserQuests();
  return quests.map((q) => ({
    id: q.periodId || q.questId,
    title: q.title,
    description: q.description,
    xpAward: q.xpAward,
    type: q.type,
    targetCount: q.targetCount,
    currentCount: q.currentCount,
    completed: q.completed,
    expiresAt: q.expiresAt,
  }));
}

export async function getActiveChallenges(): Promise<Challenge[]> {
  const catalog = await getQuestCatalog();
  return catalog.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    xpAward: q.xpAward,
    type: q.type,
    targetCount: q.targetCount,
    currentCount: 0,
    completed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }));
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
