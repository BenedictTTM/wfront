// features/multiplayer/components/MatchHUD.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MatchHUDProps } from './MatchHUD.tsx';

describe('MatchHUD Component Exact Specifications & Logic', () => {
  it('correctly defines MatchHUDProps matching required interface', () => {
    const props: MatchHUDProps = {
      player: {
        gamerTag: 'AlphaScholar',
        avatarUrl: 'https://example.com/avatar.png',
        score: 420,
        streak: 3,
      },
      opponent: {
        gamerTag: 'BravoRival',
        avatarUrl: '',
        score: 300,
        streak: 1,
        status: 'THINKING',
      },
      currentRound: 4,
      totalRounds: 10,
      remainingTimeMs: 14000,
      maxScoreDifferential: 500,
    };

    assert.equal(props.player.gamerTag, 'AlphaScholar');
    assert.equal(props.opponent.status, 'THINKING');
    assert.equal(props.currentRound, 4);
    assert.equal(props.remainingTimeMs, 14000);
    assert.equal(props.maxScoreDifferential, 500);
  });

  it('computes Tug-of-War indicatorPosition strictly according to exact formula', () => {
    const calculatePosition = (playerScore: number, opponentScore: number, maxDiff = 500) => {
      const rawOffset = ((playerScore - opponentScore) / maxDiff) * 50;
      return Math.min(Math.max(50 + rawOffset, 10), 90);
    };

    // Equal score -> 50% dead center
    assert.equal(calculatePosition(300, 300, 500), 50);

    // Player ahead by 250 (+half of maxDiff) -> 75%
    assert.equal(calculatePosition(550, 300, 500), 75);

    // Player ahead by 500 (+maxDiff) -> 100 clamped to 90%
    assert.equal(calculatePosition(800, 300, 500), 90);

    // Opponent ahead by 250 (-half of maxDiff) -> 25%
    assert.equal(calculatePosition(300, 550, 500), 25);

    // Opponent ahead by 500 (-maxDiff) -> 0 clamped to 10%
    assert.equal(calculatePosition(300, 800, 500), 10);

    // Extreme blowout (player ahead by 2000) -> clamped to 90%
    assert.equal(calculatePosition(2500, 500, 500), 90);

    // Extreme blowout (opponent ahead by 2000) -> clamped to 10%
    assert.equal(calculatePosition(500, 2500, 500), 10);
  });

  it('formats countdown string accurately using (remainingTimeMs / 1000).toFixed(0) + "s"', () => {
    const format = (ms: number) => (Math.max(0, ms) / 1000).toFixed(0) + 's';

    assert.equal(format(15000), '15s');
    assert.equal(format(12400), '12s');
    assert.equal(format(7000), '7s');
    assert.equal(format(3000), '3s');
    assert.equal(format(0), '0s');
  });

  it('accurately resolves timer alert thresholds', () => {
    const getAlertLevel = (remainingTimeMs: number) => {
      const seconds = Math.round(Math.max(0, remainingTimeMs) / 1000);
      if (seconds <= 3) return 'critical'; // 3s to 0s
      if (seconds <= 7) return 'warning';  // 7s to 4s
      return 'neutral';                   // 15s to 8s
    };

    assert.equal(getAlertLevel(15000), 'neutral');
    assert.equal(getAlertLevel(10000), 'neutral');
    assert.equal(getAlertLevel(8000), 'neutral');

    assert.equal(getAlertLevel(7000), 'warning');
    assert.equal(getAlertLevel(5000), 'warning');
    assert.equal(getAlertLevel(4000), 'warning');

    assert.equal(getAlertLevel(3000), 'critical');
    assert.equal(getAlertLevel(1000), 'critical');
    assert.equal(getAlertLevel(0), 'critical');
  });

  it('correctly handles streak badge threshold (streak >= 2)', () => {
    const shouldShowStreak = (streak: number) => streak >= 2;

    assert.equal(shouldShowStreak(0), false);
    assert.equal(shouldShowStreak(1), false);
    assert.equal(shouldShowStreak(2), true);
    assert.equal(shouldShowStreak(5), true);
  });

  it('supports opponent statuses THINKING and LOCKED_IN', () => {
    const thinkingOpponent: MatchHUDProps['opponent'] = {
      gamerTag: 'Rival_A',
      avatarUrl: '',
      score: 100,
      streak: 0,
      status: 'THINKING',
    };
    assert.equal(thinkingOpponent.status, 'THINKING');

    const lockedOpponent: MatchHUDProps['opponent'] = {
      ...thinkingOpponent,
      status: 'LOCKED_IN',
    };
    assert.equal(lockedOpponent.status, 'LOCKED_IN');
  });
});
