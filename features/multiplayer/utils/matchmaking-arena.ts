// features/multiplayer/utils/matchmaking-arena.ts

export interface MatchmakingProps {
  currentUser: {
    gamerTag: string;
    avatarUrl: string;
    elo: number;
    schoolCode: string;
  };
  matchedOpponent: {
    gamerTag: string;
    avatarUrl: string;
    elo: number;
    schoolCode: string;
  } | null;
  elapsedSeconds: number;
  onReadyToStart: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export type MatchmakingState = "SEARCHING" | "RIVAL_FOUND" | "TRANSITION_TO_MATCH";

export const CLASH_ANIMATION_DURATION_MS = 800;

export const RADAR_RINGS_CONFIG = {
  ringCount: 3,
  scaleRange: [1, 2.5] as const,
  opacityRange: [0.6, 0] as const,
  durationSeconds: 2.5,
  staggerDelaySeconds: 0.8,
};

/**
 * Returns dynamic pedagogical and tension status text based on elapsed search seconds:
 * 0s–4s: "Scanning for rivals in your tier..."
 * 5s–8s: "Widening search to regional schools..."
 * >8s:   "Calibrating duel engine..."
 */
export function getMatchmakingStatusText(elapsedSeconds: number): string {
  if (elapsedSeconds <= 4) {
    return "Scanning for rivals in your tier...";
  }
  if (elapsedSeconds <= 8) {
    return "Widening search to regional schools...";
  }
  return "Calibrating duel engine...";
}

export function formatElapsedDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
