import { z } from 'zod';

// ============================================================================
// 1. Zod Schemas for Competitive Identity & WebSocket Contracts
// ============================================================================

export const CompetitiveTierSchema = z.enum([
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'MASTER',
]);
export type CompetitiveTier = z.infer<typeof CompetitiveTierSchema>;

export const PlayerStateEnumSchema = z.enum(['THINKING', 'LOCKED_IN']);
export type PlayerStateEnum = z.infer<typeof PlayerStateEnumSchema>;

export const SchoolProfileSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  shortCode: z.string().min(1, 'School shortCode is required'),
  crestUrl: z.string().nullable(),
});
export type SchoolProfile = z.infer<typeof SchoolProfileSchema>;

export const CompetitiveStatsSchema = z.object({
  tier: CompetitiveTierSchema,
  elo: z.number().int(),
  currentStreak: z.number().int().nonnegative(),
});
export type CompetitiveStats = z.infer<typeof CompetitiveStatsSchema>;

export const AcademicStatsSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  masteryPercentage: z.number().min(0).max(100),
});
export type AcademicStats = z.infer<typeof AcademicStatsSchema>;

/**
 * Public player profile safe for multiplayer exposure over WebSockets.
 * Guarantees zero PII leakage: no emails, phone numbers, or raw integer DB IDs.
 */
export const PublicPlayerProfileSchema = z
  .object({
    id: z
      .string()
      .uuid('Player id must be an opaque UUID')
      .refine((val) => !val.includes('@'), {
        message: 'Security Violation: Player id must never be an email address',
      }),
    gamerTag: z
      .string()
      .min(3, 'gamerTag must be at least 3 characters')
      .max(16, 'gamerTag must be at most 16 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'gamerTag must only contain alphanumeric characters and underscores',
      ),
    avatarUrl: z.string().nullable(),
    school: SchoolProfileSchema,
    competitive: CompetitiveStatsSchema,
    academic: AcademicStatsSchema,
  })
  .strict();

export type PublicPlayerProfile = z.infer<typeof PublicPlayerProfileSchema>;

/**
 * WebSocket broadcast payload when two players are matched.
 */
export const MatchFoundEventSchema = z
  .object({
    matchId: z.string().uuid('matchId must be a valid UUID'),
    player1: PublicPlayerProfileSchema,
    player2: PublicPlayerProfileSchema,
    totalRounds: z.literal(10),
    timePerQuestionMs: z.literal(15000),
  })
  .strict();

export type MatchFoundEvent = z.infer<typeof MatchFoundEventSchema>;

/**
 * Real-time state synchronisation payload during a question round.
 */
export const PlayerStateSyncEventSchema = z
  .object({
    matchId: z.string().uuid('matchId must be a valid UUID'),
    playerId: z
      .string()
      .uuid('playerId must be a valid UUID')
      .refine((val) => !val.includes('@'), {
        message: 'Security Violation: playerId must never be an email address',
      }),
    state: PlayerStateEnumSchema,
    selectedTimestampMs: z.number().int().positive().nullable(),
    currentScore: z.number().int().nonnegative(),
  })
  .strict();

export type PlayerStateSyncEvent = z.infer<typeof PlayerStateSyncEventSchema>;

// ============================================================================
// 2. Database User Representation with Relations
// ============================================================================

export interface DbSchool {
  id: string;
  name: string;
  shortCode: string;
  crestUrl: string | null;
}

export interface DbCompetitiveProfile {
  userId: string;
  elo: number;
  tier: CompetitiveTier;
  winStreak: number;
  bestWinStreak: number;
}

export interface DbSubjectMastery {
  userId: string;
  subject: string;
  masteryPoints: number;
  accuracyPercentage: number;
}

export interface DbUserWithRelations {
  id: string;
  email: string;
  gamerTag?: string | null;
  avatarUrl?: string | null;
  schoolId?: string | null;
  createdAt: Date | string;
  school?: DbSchool | null;
  competitiveProfile?: DbCompetitiveProfile | null;
  subjectMasteries?: DbSubjectMastery[] | null;
}

// ============================================================================
// 3. Pure TypeScript Sanitization Utility Function
// ============================================================================

/**
 * Helper to generate a compliant fallback gamerTag if null or invalid.
 * Format: Scholar_[first_4_chars_of_id]
 */
export function generateFallbackGamerTag(userId: string): string {
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, '');
  const prefix = cleanId.slice(0, 4).padEnd(4, '0');
  return `Scholar_${prefix}`;
}

/**
 * Recursively scans any object for forbidden PII keys (specifically 'email')
 * and raw email patterns, throwing immediately if found.
 */
function assertNoEmailInObject(obj: unknown, path: string = ''): void {
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  // Check object own and inherited property names
  if (Object.prototype.hasOwnProperty.call(obj, 'email') || 'email' in (obj as Record<string, unknown>)) {
    throw new Error(
      `SECURITY VIOLATION: Exposed PII detected! The 'email' property was found in the output object at '${path || 'root'}'.`,
    );
  }

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (key.toLowerCase() === 'email') {
      throw new Error(
        `SECURITY VIOLATION: Exposed PII detected! Key '${currentPath}' found in public profile.`,
      );
    }

    if (typeof value === 'string' && key !== 'avatarUrl') {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      if (emailPattern.test(value)) {
        throw new Error(
          `SECURITY VIOLATION: Exposed PII detected! Raw email address found in value at '${currentPath}'.`,
        );
      }
    }

    if (typeof value === 'object' && value !== null) {
      assertNoEmailInObject(value, currentPath);
    }
  }
}

/**
 * Pure TypeScript function that converts an internal database user record (with relations)
 * into a strictly typed, fully sanitized PublicPlayerProfile.
 *
 * Enforces:
 * - Opaque UUID identifier (never email or integer DB ID).
 * - Fallback generation: if gamerTag is null or invalid, generates 'Scholar_[first_4_chars_of_id]'.
 * - Explicit omission of all private data (email, phone, credentials, etc.).
 * - Throws a runtime error if 'email' exists anywhere in the resulting object.
 * - Validates output via Zod and freezes the resulting profile.
 */
export function sanitizeUserToPublicProfile(
  userRecord: DbUserWithRelations,
  subject: string = 'GENERAL',
): PublicPlayerProfile {
  // 1. Resolve gamerTag with fallback generation if null, empty, or non-compliant
  let resolvedGamerTag: string;
  const rawGamerTag = userRecord.gamerTag?.trim();

  if (rawGamerTag && /^[a-zA-Z0-9_]{3,16}$/.test(rawGamerTag) && !rawGamerTag.includes('@')) {
    resolvedGamerTag = rawGamerTag;
  } else {
    resolvedGamerTag = generateFallbackGamerTag(userRecord.id);
  }

  // 2. Resolve School information
  const schoolProfile: SchoolProfile = {
    name: userRecord.school?.name ?? 'Independent Academy',
    shortCode: userRecord.school?.shortCode ?? 'IND',
    crestUrl: userRecord.school?.crestUrl ?? null,
  };

  // 3. Resolve Competitive Profile
  const competitiveStats: CompetitiveStats = {
    tier: userRecord.competitiveProfile?.tier ?? 'BRONZE',
    elo: userRecord.competitiveProfile?.elo ?? 1000,
    currentStreak: userRecord.competitiveProfile?.winStreak ?? 0,
  };

  // 4. Resolve Subject Mastery
  const matchingMastery = userRecord.subjectMasteries?.find(
    (m) => m.subject.toUpperCase() === subject.toUpperCase(),
  ) ?? userRecord.subjectMasteries?.[0];

  const academicStats: AcademicStats = {
    subject: matchingMastery?.subject ?? subject,
    masteryPercentage: matchingMastery
      ? Math.max(0, Math.min(100, Math.round(matchingMastery.accuracyPercentage * 10) / 10))
      : 0,
  };

  // 5. Construct public profile with explicit property projection
  const publicProfile: PublicPlayerProfile = {
    id: userRecord.id,
    gamerTag: resolvedGamerTag,
    avatarUrl: userRecord.avatarUrl ?? null,
    school: schoolProfile,
    competitive: competitiveStats,
    academic: academicStats,
  };

  // 6. Runtime PII Verification: strictly throw if 'email' exists
  assertNoEmailInObject(publicProfile);

  // 7. Validate against strict Zod contract and return immutable object
  const validated = PublicPlayerProfileSchema.parse(publicProfile);
  return Object.freeze(validated);
}
