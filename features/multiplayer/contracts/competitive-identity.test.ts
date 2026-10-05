// features/multiplayer/contracts/competitive-identity.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeUserToPublicProfile,
  PublicPlayerProfileSchema,
  MatchFoundEventSchema,
  PlayerStateSyncEventSchema,
} from './competitive-identity.ts';
import type {
  DbUserWithRelations,
  PublicPlayerProfile,
} from './competitive-identity.ts';

describe('Competitive Identity & State Layer Sanitization', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const opponentUuid = '987fcdeb-51a2-43f7-9876-543210987654';
  const matchUuid = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

  it('correctly maps a complete database user record to a PublicPlayerProfile', () => {
    const dbUser: DbUserWithRelations = {
      id: validUuid,
      email: 'palomakut1@gmail.com',
      gamerTag: 'Apex_Falcon',
      avatarUrl: 'https://cdn.example.com/avatars/apex.png',
      schoolId: 'school-123',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      school: {
        id: 'school-123',
        name: 'Tema Secondary High School',
        shortCode: 'TEMASHS',
        crestUrl: 'https://cdn.example.com/crests/temashs.png',
      },
      competitiveProfile: {
        userId: validUuid,
        elo: 1450,
        tier: 'GOLD',
        winStreak: 5,
        bestWinStreak: 8,
      },
      subjectMasteries: [
        {
          userId: validUuid,
          subject: 'ENGLISH',
          masteryPoints: 850,
          accuracyPercentage: 88.5,
        },
      ],
    };

    const profile = sanitizeUserToPublicProfile(dbUser, 'ENGLISH');

    assert.equal(profile.id, validUuid);
    assert.equal(profile.gamerTag, 'Apex_Falcon');
    assert.equal(profile.avatarUrl, 'https://cdn.example.com/avatars/apex.png');
    assert.equal(profile.school.name, 'Tema Secondary High School');
    assert.equal(profile.school.shortCode, 'TEMASHS');
    assert.equal(profile.school.crestUrl, 'https://cdn.example.com/crests/temashs.png');
    assert.equal(profile.competitive.tier, 'GOLD');
    assert.equal(profile.competitive.elo, 1450);
    assert.equal(profile.competitive.currentStreak, 5);
    assert.equal(profile.academic.subject, 'ENGLISH');
    assert.equal(profile.academic.masteryPercentage, 88.5);

    // CRITICAL: email must NOT exist on profile
    assert.equal('email' in (profile as unknown as Record<string, unknown>), false);
    assert.equal(Object.keys(profile).includes('email'), false);
  });

  it('generates a Scholar_[first_4_chars_of_id] fallback if gamerTag is null or empty', () => {
    const dbUser: DbUserWithRelations = {
      id: 'a1b2c3d4-1234-4567-89ab-cdef01234567',
      email: 'palomakut1@gmail.com',
      gamerTag: null,
      avatarUrl: null,
      createdAt: new Date(),
    };

    const profile = sanitizeUserToPublicProfile(dbUser);
    assert.equal(profile.gamerTag, 'Scholar_a1b2');
    assert.equal(PublicPlayerProfileSchema.safeParse(profile).success, true);
  });

  it('replaces an invalid or email-contaminated gamerTag with fallback Scholar_[first_4_chars_of_id]', () => {
    // If a legacy system stored an email as the gamerTag
    const dbUser: DbUserWithRelations = {
      id: 'e4f5a6b7-8901-4bc1-a234-56789abcdef0',
      email: 'palomakut1@gmail.com',
      gamerTag: 'palomakut1@gmail.com',
      avatarUrl: null,
      createdAt: new Date(),
    };

    const profile = sanitizeUserToPublicProfile(dbUser);
    assert.equal(profile.gamerTag, 'Scholar_e4f5');
    assert.equal(profile.gamerTag.includes('@'), false);
    assert.equal(PublicPlayerProfileSchema.safeParse(profile).success, true);
  });

  it('provides safe defaults when school, competitiveProfile, and subjectMasteries are missing', () => {
    const dbUser: DbUserWithRelations = {
      id: validUuid,
      email: 'student@study.edu',
      gamerTag: 'Nova_Mind',
      avatarUrl: null,
      createdAt: new Date(),
    };

    const profile = sanitizeUserToPublicProfile(dbUser, 'MATHEMATICS');
    assert.equal(profile.gamerTag, 'Nova_Mind');
    assert.equal(profile.school.name, 'Independent Academy');
    assert.equal(profile.school.shortCode, 'IND');
    assert.equal(profile.school.crestUrl, null);
    assert.equal(profile.competitive.tier, 'BRONZE');
    assert.equal(profile.competitive.elo, 1000);
    assert.equal(profile.competitive.currentStreak, 0);
    assert.equal(profile.academic.subject, 'MATHEMATICS');
    assert.equal(profile.academic.masteryPercentage, 0);
  });

  it('strictly throws a runtime error if email is manually attached to the output', () => {
    const dbUser: DbUserWithRelations = {
      id: validUuid,
      email: 'palomakut1@gmail.com',
      gamerTag: 'StarScholar',
      avatarUrl: null,
      createdAt: new Date(),
    };

    // Verify sanitizeUserToPublicProfile itself does not leak email
    const safe = sanitizeUserToPublicProfile(dbUser);
    assert.equal('email' in (safe as unknown as Record<string, unknown>), false);

    // Verify assertion function catches any object containing 'email'
    assert.throws(
      () => {
        const malicious = { ...safe, email: 'leaked@test.com' };
        PublicPlayerProfileSchema.parse(malicious);
      },
      /unrecognized_keys|strip/i,
    );
  });

  it('validates MatchFoundEventSchema strictly with 10 total rounds and 15000ms', () => {
    const player1: PublicPlayerProfile = {
      id: validUuid,
      gamerTag: 'Alpha_1',
      avatarUrl: null,
      school: { name: 'School A', shortCode: 'SCHA', crestUrl: null },
      competitive: { tier: 'SILVER', elo: 1150, currentStreak: 2 },
      academic: { subject: 'ENGLISH', masteryPercentage: 75.0 },
    };

    const player2: PublicPlayerProfile = {
      id: opponentUuid,
      gamerTag: 'Beta_2',
      avatarUrl: null,
      school: { name: 'School B', shortCode: 'SCHB', crestUrl: null },
      competitive: { tier: 'GOLD', elo: 1300, currentStreak: 4 },
      academic: { subject: 'ENGLISH', masteryPercentage: 82.5 },
    };

    const matchFoundEvent = {
      matchId: matchUuid,
      player1,
      player2,
      totalRounds: 10 as const,
      timePerQuestionMs: 15000 as const,
    };

    const parsed = MatchFoundEventSchema.parse(matchFoundEvent);
    assert.equal(parsed.matchId, matchUuid);
    assert.equal(parsed.totalRounds, 10);
    assert.equal(parsed.timePerQuestionMs, 15000);

    // Reject non-10 rounds
    assert.throws(() => {
      MatchFoundEventSchema.parse({
        ...matchFoundEvent,
        totalRounds: 5 as unknown as 10,
      });
    });

    // Reject non-15000ms
    assert.throws(() => {
      MatchFoundEventSchema.parse({
        ...matchFoundEvent,
        timePerQuestionMs: 20000 as unknown as 15000,
      });
    });
  });

  it('validates PlayerStateSyncEventSchema for THINKING and LOCKED_IN states', () => {
    const thinkingPayload = {
      matchId: matchUuid,
      playerId: validUuid,
      state: 'THINKING' as const,
      selectedTimestampMs: null,
      currentScore: 120,
    };

    const parsedThinking = PlayerStateSyncEventSchema.parse(thinkingPayload);
    assert.equal(parsedThinking.state, 'THINKING');
    assert.equal(parsedThinking.selectedTimestampMs, null);
    assert.equal(parsedThinking.currentScore, 120);

    const lockedInPayload = {
      matchId: matchUuid,
      playerId: validUuid,
      state: 'LOCKED_IN' as const,
      selectedTimestampMs: 1728130000123,
      currentScore: 240,
    };

    const parsedLocked = PlayerStateSyncEventSchema.parse(lockedInPayload);
    assert.equal(parsedLocked.state, 'LOCKED_IN');
    assert.equal(parsedLocked.selectedTimestampMs, 1728130000123);
    assert.equal(parsedLocked.currentScore, 240);

    // Reject invalid state
    assert.throws(() => {
      PlayerStateSyncEventSchema.parse({
        ...thinkingPayload,
        state: 'IDLE' as unknown as 'THINKING',
      });
    });

    // Reject email as playerId
    assert.throws(() => {
      PlayerStateSyncEventSchema.parse({
        ...thinkingPayload,
        playerId: 'palomakut1@gmail.com',
      });
    });
  });
});
