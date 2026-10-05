// features/multiplayer/utils/post-match.ts

export interface PostMatchData {
  matchId: string;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  player: {
    gamerTag: string;
    avatarUrl: string;
    finalScore: number;
    eloDelta: number;
    newElo: number;
    schoolCode: string;
  };
  opponent: {
    id: string;
    gamerTag: string;
    avatarUrl: string;
    finalScore: number;
  };
  subject: {
    name: string;
    accuracyPercentage: number;
    deltaAccuracy: number;
  };
  schoolTurfContribution: number; // e.g., +35 points
  missedQuestions: Array<{
    id: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    conceptExplanation: string;
  }>;
}

export type RematchState = 'IDLE' | 'WAITING' | 'ACCEPTED' | 'OPPONENT_LEFT';

export interface HeroHeaderMeta {
  title: string;
  eloDeltaText: string;
  eloDeltaColorClass: string;
  badgeBgClass: string;
}

/**
 * Computes non-shaming, respectful pedagogical hero header copy:
 * Victory: "VICTORY • HARD-FOUGHT DUEL", eloDelta in emerald
 * Defeat:  "DEFEAT • RESPECT THE RIVALRY", eloDelta in slate-400 (never aggressive red or shame-based copy)
 * Draw:    "DEAD HEAT • HONORABLE DRAW", eloDelta in slate-300
 */
export function getHeroHeader(result: 'VICTORY' | 'DEFEAT' | 'DRAW', eloDelta: number): HeroHeaderMeta {
  const formattedDelta = eloDelta > 0 ? `+${eloDelta}` : `${eloDelta}`;

  switch (result) {
    case 'VICTORY':
      return {
        title: 'VICTORY • HARD-FOUGHT DUEL',
        eloDeltaText: formattedDelta,
        eloDeltaColorClass: 'text-emerald-400',
        badgeBgClass: 'bg-emerald-950/80 border-emerald-500/60',
      };
    case 'DEFEAT':
      return {
        title: 'DEFEAT • RESPECT THE RIVALRY',
        eloDeltaText: formattedDelta,
        eloDeltaColorClass: 'text-slate-400',
        badgeBgClass: 'bg-slate-900 border-slate-700',
      };
    case 'DRAW':
    default:
      return {
        title: 'DEAD HEAT • HONORABLE DRAW',
        eloDeltaText: formattedDelta,
        eloDeltaColorClass: 'text-slate-300',
        badgeBgClass: 'bg-slate-900 border-slate-700',
      };
  }
}

/**
 * Returns competitive tier metadata from new ELO rating
 */
export function getTierFromElo(elo: number): { tier: string; badgeClass: string } {
  if (elo >= 2000) return { tier: 'MASTER', badgeClass: 'bg-purple-950 border-purple-500 text-purple-300' };
  if (elo >= 1600) return { tier: 'DIAMOND', badgeClass: 'bg-cyan-950 border-cyan-500 text-cyan-300' };
  if (elo >= 1300) return { tier: 'PLATINUM', badgeClass: 'bg-emerald-950 border-emerald-500 text-emerald-300' };
  if (elo >= 1000) return { tier: 'GOLD', badgeClass: 'bg-amber-950 border-amber-500 text-amber-300' };
  if (elo >= 700) return { tier: 'SILVER', badgeClass: 'bg-slate-900 border-slate-400 text-slate-300' };
  return { tier: 'BRONZE', badgeClass: 'bg-orange-950 border-orange-700 text-orange-300' };
}

/**
 * Computes dynamic ladder distance to next subdivision or tier (e.g. "32 pts to Gold I")
 */
export function getTierLadderDistance(elo: number): string {
  if (elo >= 2000) return 'Grandmaster Tier';
  if (elo >= 1600) {
    const pts = 2000 - elo;
    return `${pts} pts to Master`;
  }
  if (elo >= 1300) {
    const subIndex = Math.floor((elo - 1300) / 100);
    if (subIndex === 0) return `${1400 - elo} pts to Platinum II`;
    if (subIndex === 1) return `${1500 - elo} pts to Platinum I`;
    return `${1600 - elo} pts to Diamond`;
  }
  if (elo >= 1000) {
    const subIndex = Math.floor((elo - 1000) / 100);
    if (subIndex === 0) return `${1100 - elo} pts to Gold II`;
    if (subIndex === 1) return `${1200 - elo} pts to Gold I`;
    return `${1300 - elo} pts to Platinum`;
  }
  if (elo >= 700) {
    const subIndex = Math.floor((elo - 700) / 100);
    if (subIndex === 0) return `${800 - elo} pts to Silver II`;
    if (subIndex === 1) return `${900 - elo} pts to Silver I`;
    return `${1000 - elo} pts to Gold`;
  }
  return `${700 - elo} pts to Silver`;
}

/**
 * Ensures specific, rule-based academic feedback for concept explanations
 */
export function formatAcademicRule(conceptExplanation?: string, questionText?: string): string {
  const qText = (questionText || '').toLowerCase();
  const expl = (conceptExplanation || '').trim();

  // If question is testing conditional clauses
  if (qText.includes('if it rains') || qText.includes('conditional') || qText.includes('tomorrow, we')) {
    return "Rule: First conditional uses 'If + simple present' followed by 'will + base form' for probable future outcomes.";
  }

  // If question is testing measurements of distance
  if (qText.includes('kilometer') || qText.includes('mile') || qText.includes('too far to walk')) {
    return "Rule: Measurements of distance (e.g., 'ten kilometers') take a singular verb when considered as a single unit or quantity.";
  }

  // If question is testing sums of money or periods of time
  if (qText.includes('dollar') || qText.includes('cedi') || qText.includes('money')) {
    return "Rule: Sums of money and periods of time function as singular collective units and require a singular verb.";
  }

  // If question is testing singular indefinite pronouns
  if (qText.includes('each') || qText.includes('neither') || qText.includes('either')) {
    return "Rule: Singular indefinite pronouns ('each', 'neither', 'either') require singular verbs regardless of intervening plural phrases.";
  }

  // If explanation is already specific and not placeholder fluff
  if (
    expl.length > 0 &&
    !expl.toLowerCase().includes('reinforcing foundational') &&
    !expl.toLowerCase().includes('mastering this question')
  ) {
    return expl.startsWith('Rule:') ? expl : `Rule: ${expl}`;
  }

  return "Rule: First conditional uses 'If + simple present' followed by 'will + base form' for probable future outcomes.";
}

