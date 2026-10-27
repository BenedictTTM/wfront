import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAchievementsWsUrl, formatAchievementUnlockToast } from "./ws-utils.ts";

describe("Achievement Notifications & Real-Time WebSocket Specifications", () => {
  it("getAchievementsWsUrl should derive ws / wss endpoint correctly from environment", () => {
    const wsUrl = getAchievementsWsUrl();
    assert.ok(
      wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://"),
      `Expected WebSocket protocol, got: ${wsUrl}`
    );
    assert.ok(
      wsUrl.endsWith("/achievements/ws"),
      `Expected endpoint to end with /achievements/ws, got: ${wsUrl}`
    );
  });

  it("getAchievementsWsUrl should convert https URL to wss URL", () => {
    const wsUrl = getAchievementsWsUrl("https://api.lockin.study");
    assert.strictEqual(wsUrl, "wss://api.lockin.study/achievements/ws");
  });

  it("should format achievement tier unlock payload with XP and Gems correctly", () => {
    const payload = {
      achievementTitle: "Quiz Enthusiast",
      tier: 1,
      xpAwarded: 250,
      gemsAwarded: 20,
      crestUnlocked: null,
    };

    const toast = formatAchievementUnlockToast(payload);

    assert.strictEqual(toast.title, "🏆 Achievement Unlocked: Quiz Enthusiast");
    assert.strictEqual(
      toast.description,
      "Tier 1 achieved! +250 XP • +20 Gems"
    );
  });

  it("should format Tier 3 unlock payload with Honor Crest correctly", () => {
    const payload = {
      achievementTitle: "Speed Demon",
      tier: 3,
      xpAwarded: 1500,
      gemsAwarded: 150,
      crestUnlocked: {
        crestName: "Supersonic Scholar Crest",
        rarity: "LEGENDARY",
      },
    };

    const toast = formatAchievementUnlockToast(payload);

    assert.strictEqual(toast.title, "🏆 Achievement Unlocked: Speed Demon");
    assert.strictEqual(
      toast.description,
      'Tier 3 achieved! +1500 XP • +150 Gems • 🎖️ Honor Crest Unlocked: "Supersonic Scholar Crest"!'
    );
  });
});
