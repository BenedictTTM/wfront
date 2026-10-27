// features/gamification/constants.ts — definitions and static collections for gamification

export type AchievementCategory = "All" | "Quizzes" | "Streaks" | "Mastery" | "Multiplayer";

export interface AchievementBase {
  id: string;
  title: string;
  category: "Quizzes" | "Streaks" | "Mastery" | "Multiplayer";
  icon: string;
  xpAward: number;
  gemsAward?: number;
  tierText: string;
  tierStars: string;
  targetCount: number;
  unit?: string;
  metricKey: "quizzes" | "streak" | "accuracy_perfect" | "speed" | "mastery" | "pvp_wins" | "pvp_flawless";
  lockRequirement?: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  requirement: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementBase[] = [
  {
    id: "quiz-enthusiast",
    title: "Quiz Enthusiast",
    category: "Quizzes",
    icon: "📖",
    xpAward: 250,
    gemsAward: 20,
    tierText: "Tier 1: Complete 10 quizzes",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 10,
    metricKey: "quizzes",
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    category: "Quizzes",
    icon: "⚡",
    xpAward: 500,
    gemsAward: 50,
    tierText: "Tier 2: Complete 50 quizzes",
    tierStars: "★★☆ Tier 2 of 3",
    targetCount: 50,
    metricKey: "quizzes",
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    category: "Quizzes",
    icon: "⏱️",
    xpAward: 450,
    gemsAward: 30,
    tierText: "Tier 1: Finish a quiz in under 3 minutes",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 1,
    metricKey: "speed",
  },
  {
    id: "streak-prodigy",
    title: "Streak Prodigy",
    category: "Streaks",
    icon: "🔥",
    xpAward: 300,
    gemsAward: 25,
    tierText: "Tier 1: Reach a 7-day study streak",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 7,
    unit: " days",
    metricKey: "streak",
  },
  {
    id: "olympian-scholar",
    title: "Olympian Scholar",
    category: "Streaks",
    icon: "🛡️",
    xpAward: 1000,
    gemsAward: 100,
    tierText: "Tier 2: Reach a 30-day streak",
    tierStars: "★★☆ Tier 2 of 3",
    targetCount: 30,
    unit: " days",
    metricKey: "streak",
  },
  {
    id: "sharpshooter",
    title: "Sharpshooter",
    category: "Mastery",
    icon: "🎯",
    xpAward: 400,
    gemsAward: 35,
    tierText: "Tier 1: Score 100% on 3 quizzes",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 3,
    metricKey: "accuracy_perfect",
  },
  {
    id: "subject-specialist",
    title: "Subject Specialist",
    category: "Mastery",
    icon: "🧬",
    xpAward: 750,
    gemsAward: 60,
    tierText: "Tier 1: Reach 90% mastery in any subject",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 90,
    unit: "%",
    metricKey: "mastery",
  },
  {
    id: "syllabus-legend",
    title: "Syllabus Legend",
    category: "Mastery",
    icon: "👑",
    xpAward: 1500,
    gemsAward: 150,
    tierText: "Tier 3: Master all subject core modules",
    tierStars: "★★★ Tier 3 of 3",
    targetCount: 5,
    metricKey: "mastery",
    lockRequirement: "Unlocks after Tier 2 Mastery",
  },
  {
    id: "arena-contender",
    title: "Arena Contender",
    category: "Multiplayer",
    icon: "⚔️",
    xpAward: 600,
    gemsAward: 50,
    tierText: "Tier 1: Win 5 live 1v1 showdowns",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 5,
    metricKey: "pvp_wins",
  },
  {
    id: "flawless-victory",
    title: "Flawless Victory",
    category: "Multiplayer",
    icon: "✨",
    xpAward: 800,
    gemsAward: 75,
    tierText: "Tier 1: Win a match without a wrong answer",
    tierStars: "★☆☆ Tier 1 of 3",
    targetCount: 1,
    metricKey: "pvp_flawless",
  },
  {
    id: "duels-champion",
    title: "Duels Champion",
    category: "Multiplayer",
    icon: "🎖️",
    xpAward: 1000,
    gemsAward: 100,
    tierText: "Tier 2: Win 15 multiplayer showdowns",
    tierStars: "★★☆ Tier 2 of 3",
    targetCount: 15,
    metricKey: "pvp_wins",
  },
];

export const BADGES_COLLECTION: BadgeItem[] = [
  {
    id: "scholar-seal",
    name: "Achimota Scholar's Crest",
    description: "Conferred for completing 100 qualifying quizzes with at least 80% accuracy.",
    icon: "🏫",
    rarity: "RARE",
    requirement: "Complete 100 quizzes with >=80% accuracy",
  },
  {
    id: "chronos-sprinter",
    name: "Chronos Sprinter",
    description: "Conferred for completing 25 qualifying quizzes under 120 seconds with >=80% accuracy.",
    icon: "⏱️",
    rarity: "RARE",
    requirement: "25 quizzes under 120 seconds",
  },
  {
    id: "streak-flame",
    name: "Olympian Torch of Habit",
    description: "Awarded to relentless students maintaining 30 consecutive qualifying study days.",
    icon: "🔥",
    rarity: "EPIC",
    requirement: "Maintain a 30-day consecutive study streak",
  },
  {
    id: "perfect-score",
    name: "Centurion Bullseye",
    description: "Given for attaining flawless 100% scores on 10 distinct timed mock papers.",
    icon: "🎯",
    rarity: "LEGENDARY",
    requirement: "Score 100% on 10 timed mock papers",
  },
  {
    id: "arena-champion",
    name: "Gladiator of WAEC",
    description: "Proof of dominance across 25 verified live 1v1 academic multiplayer arenas.",
    icon: "⚔️",
    rarity: "EPIC",
    requirement: "Win 25 live multiplayer 1v1 challenges",
  },
];

