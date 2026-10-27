import { apiGet, apiPost } from "@/lib/api-client";
import {
  ClaimRewardResponse,
  LeaderboardResponse,
  UserDashboard,
  UserEnergy,
  UserQuest,
} from "./types";

export async function getDashboard(): Promise<UserDashboard> {
  return apiGet<UserDashboard>("/users/me/dashboard");
}

export async function getEnergy(): Promise<UserEnergy> {
  return apiGet<UserEnergy>("/users/me/energy");
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

export async function claimQuestReward(periodId: string): Promise<ClaimRewardResponse> {
  return apiPost<ClaimRewardResponse>(`/users/me/quests/${encodeURIComponent(periodId)}/claim`);
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

export async function getMyAchievements(): Promise<import("./types").ServerAchievementProgress[]> {
  return apiGet<import("./types").ServerAchievementProgress[]>("/achievements/me");
}

export async function getAchievementCatalog(): Promise<import("./types").ServerAchievementProgress[]> {
  return apiGet<import("./types").ServerAchievementProgress[]>("/achievements");
}

export { getAchievementsWsUrl } from "./ws-utils";


