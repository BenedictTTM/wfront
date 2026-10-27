// features/gamification/ws-utils.ts

/**
 * Returns the WebSocket URL for the achievements real-time gateway.
 * Converts http(s) API URL to ws(s) protocol.
 */
export function getAchievementsWsUrl(apiUrl?: string): string {
  const base = (apiUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/achievements/ws`;
}

export function formatAchievementUnlockToast(payload: {
  achievementTitle: string;
  tier: number;
  xpAwarded: number;
  gemsAwarded?: number;
  crestUnlocked?: { crestName: string; rarity?: string } | null;
}): { title: string; description: string } {
  const crestText = payload.crestUnlocked
    ? ` • 🎖️ Honor Crest Unlocked: "${payload.crestUnlocked.crestName}"!`
    : "";
  const gemText = payload.gemsAwarded ? ` • +${payload.gemsAwarded} Gems` : "";

  return {
    title: `🏆 Achievement Unlocked: ${payload.achievementTitle}`,
    description: `Tier ${payload.tier} achieved! +${payload.xpAwarded} XP${gemText}${crestText}`,
  };
}
