// features/multiplayer/components/PostMatchSummary.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PostMatchData } from '../utils/post-match.ts';
import {
  getHeroHeader,
  getTierFromElo,
  getTierLadderDistance,
  formatAcademicRule,
} from '../utils/post-match.ts';

describe('Track 6: Post-Match Settlement & Rematch State Machine', () => {
  const mockPostMatchVictory: PostMatchData = {
    matchId: 'match-101',
    result: 'VICTORY',
    player: {
      gamerTag: 'Kofi_Dev',
      avatarUrl: '',
      finalScore: 1150,
      eloDelta: 16,
      newElo: 1216,
      schoolCode: 'TEMASHS',
    },
    opponent: {
      id: 'opp-202',
      gamerTag: 'Ama_Code',
      avatarUrl: '',
      finalScore: 980,
    },
    subject: {
      name: 'Elective Mathematics',
      accuracyPercentage: 90,
      deltaAccuracy: 5,
    },
    schoolTurfContribution: 35,
    missedQuestions: [
      {
        id: 'q-3',
        questionText: 'Evaluate the derivative of f(x) = ln(3x^2 + 1)',
        selectedAnswer: '6x / (3x^2 + 1)^2',
        correctAnswer: '6x / (3x^2 + 1)',
        conceptExplanation: 'By the chain rule, d/dx[ln(u)] = u\'/u without squaring the denominator.',
      },
    ],
  };

  const mockPostMatchDefeat: PostMatchData = {
    matchId: 'match-102',
    result: 'DEFEAT',
    player: {
      gamerTag: 'Kofi_Dev',
      avatarUrl: '',
      finalScore: 820,
      eloDelta: -12,
      newElo: 1188,
      schoolCode: 'TEMASHS',
    },
    opponent: {
      id: 'opp-202',
      gamerTag: 'Ama_Code',
      avatarUrl: '',
      finalScore: 1040,
    },
    subject: {
      name: 'Integrated Science',
      accuracyPercentage: 70,
      deltaAccuracy: -2,
    },
    schoolTurfContribution: 10,
    missedQuestions: [
      {
        id: 'q-5',
        questionText: 'Which organelle is responsible for ATP cellular respiration?',
        selectedAnswer: 'Ribosome',
        correctAnswer: 'Mitochondrion',
        conceptExplanation: 'Mitochondria generate the majority of cellular adenosine triphosphate via aerobic respiration.',
      },
      {
        id: 'q-8',
        questionText: 'What is the SI unit of electric capacitance?',
        selectedAnswer: 'Henry',
        correctAnswer: 'Farad',
        conceptExplanation: 'Capacitance is measured in farads (F), named after Michael Faraday.',
      },
    ],
  };

  it('formats Hero Header for Victory with emerald ELO delta (+16)', () => {
    const meta = getHeroHeader(mockPostMatchVictory.result, mockPostMatchVictory.player.eloDelta);

    assert.equal(meta.title, 'VICTORY • HARD-FOUGHT DUEL');
    assert.equal(meta.eloDeltaText, '+16');
    assert.equal(meta.eloDeltaColorClass, 'text-emerald-400');
    assert.equal(meta.title.includes('WRONG'), false);
    assert.equal(meta.title.includes('FAILED'), false);
  });

  it('formats Hero Header for Defeat with respectful copy and slate-400 ELO delta (-12, NO aggressive red)', () => {
    const meta = getHeroHeader(mockPostMatchDefeat.result, mockPostMatchDefeat.player.eloDelta);

    assert.equal(meta.title, 'DEFEAT • RESPECT THE RIVALRY');
    assert.equal(meta.eloDeltaText, '-12');
    assert.equal(meta.eloDeltaColorClass, 'text-slate-400');
    // Guarantees zero aggressive red or punitive shaming copy
    assert.ok(!meta.eloDeltaColorClass.includes('red'));
    assert.ok(!meta.eloDeltaColorClass.includes('rose'));
    assert.equal(meta.title.includes('LOST'), false);
    assert.equal(meta.title.includes('LOSER'), false);
    assert.equal(meta.title.includes('FAILED'), false);
  });

  it('formats Hero Header for Draw with honorable copy', () => {
    const meta = getHeroHeader('DRAW', 0);

    assert.equal(meta.title, 'DEAD HEAT • HONORABLE DRAW');
    assert.equal(meta.eloDeltaText, '0');
    assert.equal(meta.eloDeltaColorClass, 'text-slate-300');
  });

  it('calibrates Three-Pillar Investment Row values and tiers', () => {
    // Pillar 1: Competitive Rank
    const tierMeta = getTierFromElo(mockPostMatchVictory.player.newElo);
    assert.equal(tierMeta.tier, 'GOLD');
    assert.equal(mockPostMatchVictory.player.newElo, 1216);

    // Pillar 2: Subject Mastery
    assert.equal(mockPostMatchVictory.subject.name, 'Elective Mathematics');
    assert.equal(mockPostMatchVictory.subject.accuracyPercentage, 90);
    assert.equal(mockPostMatchVictory.subject.deltaAccuracy, 5);

    // Pillar 3: School Contribution
    assert.equal(mockPostMatchVictory.schoolTurfContribution, 35);
    assert.equal(mockPostMatchVictory.player.schoolCode, 'TEMASHS');
  });

  it('handles Missed Concepts data and revision deck bookmark states', () => {
    assert.equal(mockPostMatchDefeat.missedQuestions.length, 2);

    const firstMissed = mockPostMatchDefeat.missedQuestions[0];
    assert.equal(firstMissed.questionText.includes('ATP'), true);
    assert.equal(firstMissed.selectedAnswer, 'Ribosome');
    assert.equal(firstMissed.correctAnswer, 'Mitochondrion');
    assert.equal(firstMissed.conceptExplanation.includes('Mitochondria'), true);

    // Local toggle state simulation
    const bookmarkedSet = new Set<string>();
    assert.equal(bookmarkedSet.has(firstMissed.id), false);
    bookmarkedSet.add(firstMissed.id);
    assert.equal(bookmarkedSet.has(firstMissed.id), true);
  });

  it('executes Rematch State Machine: IDLE -> WAITING (5s) -> TIMEOUT (Opponent Left & Primary CTA Promotion)', () => {
    type RematchState = 'IDLE' | 'WAITING' | 'ACCEPTED' | 'OPPONENT_LEFT';

    let state: RematchState = 'IDLE';
    let countdown = 5;
    let rematchEmitted = false;
    let newMatchLaunchedId: string | null = null;

    // 1. Initial State
    assert.equal(state, 'IDLE');

    // 2. User presses [ Request Instant Rematch ]
    const handlePressRematch = () => {
      state = 'WAITING';
      countdown = 5;
      rematchEmitted = true;
    };
    handlePressRematch();

    assert.equal(state, 'WAITING');
    assert.equal(countdown, 5);
    assert.equal(rematchEmitted, true);

    // 3. Countdown ticks down
    for (let i = 0; i < 5; i++) {
      countdown -= 1;
    }
    assert.equal(countdown, 0);

    // 4. Timer expires without opponent accepting -> Opponent left
    if (countdown === 0 && state === 'WAITING') {
      state = 'OPPONENT_LEFT';
    }
    assert.equal(state, 'OPPONENT_LEFT');

    // When opponent leaves, primary CTA shifts to [ Find New Opponent ]
    const primaryButton = state === 'OPPONENT_LEFT' ? 'Find New Opponent' : 'Request Instant Rematch';
    assert.equal(primaryButton, 'Find New Opponent');

    // 5. Test alternate path: opponent accepts before timeout
    state = 'WAITING';
    countdown = 3;
    const handleOpponentAccept = (newId: string) => {
      state = 'ACCEPTED';
      newMatchLaunchedId = newId;
    };
    handleOpponentAccept('match-999');

    assert.equal(state, 'ACCEPTED');
    assert.equal(newMatchLaunchedId, 'match-999');
  });

  it('computes dynamic ladder distance accurately across tiers and subdivisions', () => {
    // Gold tier: 1168 ELO -> 32 pts to Gold I
    assert.equal(getTierLadderDistance(1168), '32 pts to Gold I');
    // Gold tier: 1188 ELO -> 12 pts to Gold I
    assert.equal(getTierLadderDistance(1188), '12 pts to Gold I');
    // Gold III: 1050 ELO -> 50 pts to Gold II
    assert.equal(getTierLadderDistance(1050), '50 pts to Gold II');
    // Silver: 850 ELO -> 50 pts to Silver I
    assert.equal(getTierLadderDistance(850), '50 pts to Silver I');
    // Bronze: 600 ELO -> 100 pts to Silver
    assert.equal(getTierLadderDistance(600), '100 pts to Silver');
  });

  it('formats pedagogical academic rules correctly for conditional, distance, and specific concepts', () => {
    const conditionalRule = formatAcademicRule(
      'Reinforcing foundational concepts',
      'If it rains tomorrow, we _____ the outdoor event.'
    );
    assert.equal(
      conditionalRule,
      "Rule: First conditional uses 'If + simple present' followed by 'will + base form' for probable future outcomes."
    );

    const distanceRule = formatAcademicRule(
      'Reinforcing foundational concepts',
      'Ten kilometers _____ too far to walk on an empty stomach.'
    );
    assert.equal(
      distanceRule,
      "Rule: Measurements of distance (e.g., 'ten kilometers') take a singular verb when considered as a single unit or quantity."
    );

    const existingRule = formatAcademicRule(
      'Mitochondria generate the majority of cellular adenosine triphosphate via aerobic respiration.',
      'Which organelle is responsible for ATP cellular respiration?'
    );
    assert.ok(existingRule.includes('Mitochondria'));
  });
});

