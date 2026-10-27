// features/gamification/assets.ts — Centralized asset mapping for achievement badges and prestige crests

export const ACHIEVEMENT_BADGES: Record<string, string> = {
  "quiz-enthusiast": "/badges/quiz-enthusiast.png",
  "speed-demon": "/badges/speed-demon.png",
  "streak-prodigy": "/badges/streak-prodigy.png",
  "sharpshooter": "/badges/sharpshooter.png",
  "gladiator-waec": "/badges/gladiator-waec.png",
  // Legacy aliases
  "knowledge-seeker": "/achievements/ic_achievement_honeycomb-tier_01_128.png",
  "olympian-scholar": "/achievements/ic_achievement_perfect-attendance_128.png",
  "subject-specialist": "/achievements/ic_achievement_gold-rush-strike_128.png",
  "syllabus-legend": "/achievements/ic_achievement_rank-platinum_128.png",
  "arena-contender": "/badges/gladiator-waec.png",
  "flawless-victory": "/achievements/ic_achievement_mastery-star_128.png",
  "duels-champion": "/achievements/ic_achievement_rank-challenger_128.png",
};

export const PRESTIGE_CRESTS: Record<string, string> = {
  // Keyed by achievement ID
  "quiz-enthusiast": "/badges/crests/achimota-scholars-crest.png",
  "speed-demon": "/badges/crests/chronos-sprinter.png",
  "streak-prodigy": "/badges/crests/olympian-torch-of-habit.png",
  "sharpshooter": "/badges/crests/centurion-bullseye.png",
  "gladiator-waec": "/badges/crests/gladiator-of-waec.png",

  // Keyed by crest title / normalized name
  "achimota-scholars-crest": "/badges/crests/achimota-scholars-crest.png",
  "Achimota Scholar's Crest": "/badges/crests/achimota-scholars-crest.png",
  "chronos-sprinter": "/badges/crests/chronos-sprinter.png",
  "Chronos Sprinter": "/badges/crests/chronos-sprinter.png",
  "olympian-torch-of-habit": "/badges/crests/olympian-torch-of-habit.png",
  "Olympian Torch of Habit": "/badges/crests/olympian-torch-of-habit.png",
  "centurion-bullseye": "/badges/crests/centurion-bullseye.png",
  "Centurion Bullseye": "/badges/crests/centurion-bullseye.png",
  "gladiator-of-waec": "/badges/crests/gladiator-of-waec.png",
  "Gladiator of WAEC": "/badges/crests/gladiator-of-waec.png",
  // Legacy badges collection IDs
  "scholar-seal": "/badges/crests/achimota-scholars-crest.png",
  "streak-flame": "/badges/crests/olympian-torch-of-habit.png",
  "perfect-score": "/badges/crests/centurion-bullseye.png",
  "arena-champion": "/badges/crests/gladiator-of-waec.png",
};

/**
 * Safely resolves an achievement badge image path.
 * Returns null if no custom artwork is mapped, triggering fallback to emoji/placeholder.
 */
export function getAchievementBadgePath(achievementId: string): string | null {
  return ACHIEVEMENT_BADGES[achievementId] ?? null;
}

/**
 * Safely resolves a prestige crest image path by achievement ID, crest name, or badge ID.
 */
export function getPrestigeCrestPath(identifierOrName?: string | null): string | null {
  if (!identifierOrName) return null;
  return PRESTIGE_CRESTS[identifierOrName] ?? null;
}
