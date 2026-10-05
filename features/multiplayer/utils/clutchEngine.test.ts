// features/multiplayer/utils/clutchEngine.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateClutchState,
  MAX_POINTS_PER_QUESTION,
  STANDARD_BASE_POINTS,
  MAX_SPEED_BONUS,
  MAX_STREAK_BONUS,
  type GameState,
  type ClutchAnalysis,
} from './clutchEngine.ts';

describe('Track 5: Mathematical Clutch Engine (clutchEngine.ts)', () => {
  it('verifies scoring rules and constants composition (135 pts max)', () => {
    assert.equal(STANDARD_BASE_POINTS, 100);
    assert.equal(MAX_SPEED_BONUS, 20);
    assert.equal(MAX_STREAK_BONUS, 15);
    assert.equal(
      STANDARD_BASE_POINTS + MAX_SPEED_BONUS + MAX_STREAK_BONUS,
      MAX_POINTS_PER_QUESTION,
    );
    assert.equal(MAX_POINTS_PER_QUESTION, 135);
  });

  it('evaluates that a comeback is possible on Question 9 (gap 180)', () => {
    // Question 9 of 10:
    // remainingQuestions = 10 - 9 + 1 = 2
    // maxRemainingScore = 2 * 135 = 270
    // scoreGap = 180 <= 270 -> comeback is possible!
    const gameState: GameState = {
      currentQuestion: 9,
      totalQuestions: 10,
      playerScore: 700,
      opponentScore: 880,
    };

    const analysis: ClutchAnalysis = evaluateClutchState(gameState);

    assert.equal(analysis.status, 'CLUTCH_WINDOW');
    assert.equal(analysis.scoreGap, 180);
    assert.equal(analysis.maxRemainingScore, 270);
    assert.equal(analysis.isComebackPossible, true);
    assert.equal(analysis.headlineCopy, '⚡ CLUTCH WINDOW ACTIVE');
    assert.equal(
      analysis.subCopy,
      'Gap: 180 pts • 2 questions remaining • Match is live.',
    );
  });

  it('evaluates that a comeback is mathematically impossible on Question 10 (gap 150)', () => {
    // Question 10 of 10:
    // remainingQuestions = 10 - 10 + 1 = 1
    // maxRemainingScore = 1 * 135 = 135
    // scoreGap = 150 > 135 -> mathematically impossible to overcome deficit!
    const gameState: GameState = {
      currentQuestion: 10,
      totalQuestions: 10,
      playerScore: 750,
      opponentScore: 900,
    };

    const analysis: ClutchAnalysis = evaluateClutchState(gameState);

    assert.equal(analysis.status, 'DECIDED');
    assert.equal(analysis.scoreGap, 150);
    assert.equal(analysis.maxRemainingScore, 135);
    assert.equal(analysis.isComebackPossible, false);
    assert.equal(analysis.headlineCopy, 'MASTERY TARGET ACTIVE');
    assert.equal(
      analysis.subCopy,
      'Score locked — finish above 80% accuracy to protect subject rating.',
    );
  });

  it('evaluates a perfect tie on Question 10', () => {
    // Question 10 of 10:
    // scoreGap = 0 -> Status is 'TIED'
    const gameState: GameState = {
      currentQuestion: 10,
      totalQuestions: 10,
      playerScore: 950,
      opponentScore: 950,
    };

    const analysis: ClutchAnalysis = evaluateClutchState(gameState);

    assert.equal(analysis.status, 'TIED');
    assert.equal(analysis.scoreGap, 0);
    assert.equal(analysis.isComebackPossible, true);
    assert.equal(analysis.headlineCopy, 'DEAD HEAT');
    assert.equal(
      analysis.subCopy,
      'Scores level • 1 questions remaining • Match is live.',
    );
  });

  it('evaluates clutch window activation on Question 8 with recoverable deficit', () => {
    // Question 8 of 10:
    // remainingQuestions = 10 - 8 + 1 = 3
    // maxRemainingScore = 3 * 135 = 405
    // scoreGap = 250 <= 405 -> CLUTCH_WINDOW
    const gameState: GameState = {
      currentQuestion: 8,
      totalQuestions: 10,
      playerScore: 600,
      opponentScore: 850,
    };

    const analysis: ClutchAnalysis = evaluateClutchState(gameState);

    assert.equal(analysis.status, 'CLUTCH_WINDOW');
    assert.equal(analysis.scoreGap, 250);
    assert.equal(analysis.maxRemainingScore, 405);
    assert.equal(analysis.isComebackPossible, true);
    assert.equal(analysis.headlineCopy, '⚡ CLUTCH WINDOW ACTIVE');
    assert.equal(
      analysis.subCopy,
      'Gap: 250 pts • 3 questions remaining • Match is live.',
    );
  });

  it('evaluates comfortable status prior to Question 8 when gap is recoverable', () => {
    // Question 5 of 10:
    // remainingQuestions = 10 - 5 + 1 = 6
    // maxRemainingScore = 6 * 135 = 810
    // scoreGap = 120 <= 810 -> COMFORTABLE
    const gameState: GameState = {
      currentQuestion: 5,
      totalQuestions: 10,
      playerScore: 480,
      opponentScore: 600,
    };

    const analysis: ClutchAnalysis = evaluateClutchState(gameState);

    assert.equal(analysis.status, 'COMFORTABLE');
    assert.equal(analysis.scoreGap, 120);
    assert.equal(analysis.maxRemainingScore, 810);
    assert.equal(analysis.isComebackPossible, true);
    assert.equal(analysis.headlineCopy, 'IN STRIDE');
    assert.equal(analysis.subCopy, 'Gap: 120 pts • 6 questions remaining.');
  });
});
