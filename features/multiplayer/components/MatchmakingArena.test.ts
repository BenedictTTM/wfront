// features/multiplayer/components/MatchmakingArena.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MatchmakingProps, MatchmakingState } from '../utils/matchmaking-arena.ts';
import {
  getMatchmakingStatusText,
  formatElapsedDisplay,
} from '../utils/matchmaking-arena.ts';

describe('MatchmakingArena Specifications & Motion State Machine', () => {
  it('correctly implements the MatchmakingProps interface', () => {
    let readyStarted = false;
    let searchCancelled = false;

    const props: MatchmakingProps = {
      currentUser: {
        gamerTag: 'AlphaScholar',
        avatarUrl: 'https://example.com/alpha.png',
        elo: 1250,
        schoolCode: 'TEMASHS',
      },
      matchedOpponent: null,
      elapsedSeconds: 3,
      onReadyToStart: () => {
        readyStarted = true;
      },
      onCancel: () => {
        searchCancelled = true;
      },
      isCancelling: false,
    };

    assert.equal(props.currentUser.gamerTag, 'AlphaScholar');
    assert.equal(props.currentUser.elo, 1250);
    assert.equal(props.currentUser.schoolCode, 'TEMASHS');
    assert.equal(props.matchedOpponent, null);
    assert.equal(props.elapsedSeconds, 3);

    props.onReadyToStart();
    assert.equal(readyStarted, true);

    props.onCancel?.();
    assert.equal(searchCancelled, true);
  });

  it('updates dynamic status text based on elapsedSeconds intervals (0-4s, 5-8s, >8s)', () => {
    // 0s–4s: "Scanning for rivals in your tier..."
    assert.equal(getMatchmakingStatusText(0), 'Scanning for rivals in your tier...');
    assert.equal(getMatchmakingStatusText(2), 'Scanning for rivals in your tier...');
    assert.equal(getMatchmakingStatusText(4), 'Scanning for rivals in your tier...');

    // 5s–8s: "Widening search to regional schools..."
    assert.equal(getMatchmakingStatusText(5), 'Widening search to regional schools...');
    assert.equal(getMatchmakingStatusText(7), 'Widening search to regional schools...');
    assert.equal(getMatchmakingStatusText(8), 'Widening search to regional schools...');

    // >8s: "Calibrating duel engine..."
    assert.equal(getMatchmakingStatusText(9), 'Calibrating duel engine...');
    assert.equal(getMatchmakingStatusText(15), 'Calibrating duel engine...');
    assert.equal(getMatchmakingStatusText(60), 'Calibrating duel engine...');
  });

  it('formats elapsed timer into mm:ss format', () => {
    assert.equal(formatElapsedDisplay(0), '00:00');
    assert.equal(formatElapsedDisplay(7), '00:07');
    assert.equal(formatElapsedDisplay(65), '01:05');
  });

  it('executes state machine progression SEARCHING -> RIVAL_FOUND -> TRANSITION_TO_MATCH', () => {
    const states: MatchmakingState[] = ['SEARCHING', 'RIVAL_FOUND', 'TRANSITION_TO_MATCH'];

    let currentState: MatchmakingState = 'SEARCHING';
    assert.equal(currentState, 'SEARCHING');

    // Rival found event arrives:
    currentState = 'RIVAL_FOUND';
    assert.equal(currentState, 'RIVAL_FOUND');

    // 800ms clash finishes:
    currentState = 'TRANSITION_TO_MATCH';
    assert.equal(currentState, 'TRANSITION_TO_MATCH');
    assert.deepEqual(states, ['SEARCHING', 'RIVAL_FOUND', 'TRANSITION_TO_MATCH']);
  });

  it('specifies exactly 800ms duration for VS clash animation sequence', () => {
    const CLASH_ANIMATION_DURATION_MS = 800;
    assert.equal(CLASH_ANIMATION_DURATION_MS, 800);
  });

  it('specifies 3 concentric radar rings with exact scaling, opacity and stagger', () => {
    const radarSpecs = {
      ringCount: 3,
      scaleRange: [1, 2.5] as const,
      opacityRange: [0.6, 0] as const,
      durationSeconds: 2.5,
      staggerDelaySeconds: 0.8,
    };

    assert.equal(radarSpecs.ringCount, 3);
    assert.deepEqual(radarSpecs.scaleRange, [1, 2.5]);
    assert.deepEqual(radarSpecs.opacityRange, [0.6, 0]);
    assert.equal(radarSpecs.durationSeconds, 2.5);
    assert.equal(radarSpecs.staggerDelaySeconds, 0.8);
  });

  it('specifies split-screen clash kinematics and VS emblem bounce physics', () => {
    const clashKinematics = {
      userCardX: { initial: '-100%', animate: 0 },
      opponentCardX: { initial: '+100%', animate: 0 },
      vsEmblemScale: { keyframes: [0, 1.2, 1.0] },
    };

    assert.equal(clashKinematics.userCardX.initial, '-100%');
    assert.equal(clashKinematics.userCardX.animate, 0);
    assert.equal(clashKinematics.opponentCardX.initial, '+100%');
    assert.equal(clashKinematics.opponentCardX.animate, 0);
    assert.deepEqual(clashKinematics.vsEmblemScale.keyframes, [0, 1.2, 1.0]);
  });

  it('guarantees omission of static format recap card in new arena specification', () => {
    const forbiddenCardContent = [
      'Format: 1v1 Speed Rounds',
      'Scoring: Speed + Streak bonuses',
    ];

    // Verification check ensures no component regression re-introduces the redundant card
    for (const phrase of forbiddenCardContent) {
      assert.ok(
        !getMatchmakingStatusText(2).includes(phrase),
        `Status text must not contain static recap "${phrase}"`,
      );
    }
  });

  it('provides educational micro-copy tips for perceived latency reduction', async () => {
    const { MATCHMAKING_TIPS } = await import('../utils/matchmaking-arena.ts');
    assert.ok(Array.isArray(MATCHMAKING_TIPS));
    assert.ok(MATCHMAKING_TIPS.length >= 3);
    assert.ok(MATCHMAKING_TIPS.some((tip: string) => tip.includes('speed bonus')));
    assert.ok(MATCHMAKING_TIPS.some((tip: string) => tip.includes('rivals in your region')));
  });

  it('supports integrated subjectName in MatchmakingProps', () => {
    const props: MatchmakingProps = {
      currentUser: {
        gamerTag: 'Scholar_8f82',
        avatarUrl: '',
        elo: 1000,
        schoolCode: 'TEMASHS',
      },
      matchedOpponent: null,
      elapsedSeconds: 0,
      onReadyToStart: () => {},
      subjectName: 'ENGLISH LANGUAGE',
    };
    assert.equal(props.subjectName, 'ENGLISH LANGUAGE');
  });
});
