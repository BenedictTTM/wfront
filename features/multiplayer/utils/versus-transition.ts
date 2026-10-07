// features/multiplayer/utils/versus-transition.ts

/**
 * Combatant Profile specification for WASSCE high-school duels.
 */
export interface CombatantProfile {
  username: string;
  avatarUrl?: string | null;
  elo: number;
  schoolName: string;
  schoolShortCode: string; // e.g., "PMP", "MOT", "PRS", "ACH"
  schoolColor: string; // Primary hex color (e.g. "#055B38" for Prempeh green)
  schoolAccentColor?: string; // Secondary accent hex (e.g. "#F4D06F" for golden yellow)
  crestUrl?: string | null; // School crest image URL
  motto?: string; // School Latin/Twi motto
  region?: string; // Region / City
  rankTitle?: string; // e.g. "Ashanti Regional Champion"
}

export interface VersusMatchTransitionProps {
  player1: CombatantProfile;
  player2: CombatantProfile;
  subject?: string;
  stakes?: string;
  onComplete?: () => void;
  durationMs?: number; // defaults to 2500ms
  className?: string;
  autoStart?: boolean;
}

/**
 * Timing constants for the snappy animation sequence (in ms):
 * - 0ms - 400ms: Left and Right panels slide in aggressively with spring overshoot.
 * - 400ms - 700ms: Center "VS" starburst slams down with a hard bounce.
 * - 700ms - 2200ms: "READY... SET... CLASH!" countdown indicator pulses.
 * - 2500ms: onComplete callback triggered to seamlessly transition to Question 1.
 */
export const VERSUS_ANIMATION_TIMINGS = {
  panelSlideDurationMs: 400,
  vsSlamDelayMs: 400,
  vsSlamDurationMs: 300,
  readyCountdownDelayMs: 700,
  setCountdownDelayMs: 1400,
  clashCountdownDelayMs: 2100,
  totalDurationMs: 2500,
} as const;

/**
 * Extracts a resilient 3-letter uppercase abbreviation for school crest fallback boxes.
 */
export function getSchoolAbbreviation(shortCode: string): string {
  if (!shortCode) return "SCH";
  return shortCode.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
}

/**
 * Extracts resilient 2-letter uppercase initials for combatant avatar fallbacks.
 */
export function getUserInitials(username: string): string {
  if (!username) return "SH";
  const clean = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return clean.slice(0, 2) || "SH";
}

/**
 * Production-ready mock data: Prempeh College ("Amanfoo") vs. Achimota School ("Motown/Akora")
 */
export const MOCK_PREMPEH_COLLEGE: CombatantProfile = {
  username: "Kofi_Amanfoo",
  avatarUrl: null, // Verifies avatar fallback resilience
  elo: 1420,
  schoolName: "Prempeh College",
  schoolShortCode: "PMP",
  schoolColor: "#055B38", // Deep Prempeh Forest Green
  schoolAccentColor: "#F4D06F", // Golden Yellow
  crestUrl: null, // Verifies sharp 3-letter box fallback ("PMP")
  motto: "Suban ne Nimdeε",
  region: "Kumasi, Ashanti",
  rankTitle: "Ashanti Regional Champion",
};

export const MOCK_ACHIMOTA_SCHOOL: CombatantProfile = {
  username: "Nana_Akora",
  avatarUrl: null, // Verifies avatar fallback resilience
  elo: 1395,
  schoolName: "Achimota School",
  schoolShortCode: "MOT",
  schoolColor: "#172554", // Motown Navy Blue
  schoolAccentColor: "#93C5FD",
  crestUrl: null, // Verifies sharp 3-letter box fallback ("MOT")
  motto: "Ut Omnes Unum Sint",
  region: "Legon, Greater Accra",
  rankTitle: "Greater Accra Top Seed",
};

export const MOCK_VERSUS_MATCH = {
  player1: MOCK_PREMPEH_COLLEGE,
  player2: MOCK_ACHIMOTA_SCHOOL,
  subject: "CORE MATHEMATICS • SPEED ROUND",
  stakes: "+25 SCHOOL TURF PTS",
};
