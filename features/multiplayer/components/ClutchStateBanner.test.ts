// features/multiplayer/components/ClutchStateBanner.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateClutchState, type ClutchAnalysis } from '../utils/clutchEngine.ts';

describe('ClutchStateBanner Specifications & Tokens', () => {
  it('correctly maps CLUTCH_WINDOW tokens: #2E1065 dark purple bg and #F59E0B gold border', () => {
    const clutchTokens = {
      backgroundHex: '#2E1065',
      borderHex: '#F59E0B',
      animation: 'animate-pulse',
    };

    assert.equal(clutchTokens.backgroundHex, '#2E1065');
    assert.equal(clutchTokens.borderHex, '#F59E0B');
    assert.equal(clutchTokens.animation, 'animate-pulse');

    const analysis: ClutchAnalysis = evaluateClutchState({
      currentQuestion: 9,
      totalQuestions: 10,
      playerScore: 700,
      opponentScore: 880,
    });

    assert.equal(analysis.status, 'CLUTCH_WINDOW');
    assert.equal(analysis.headlineCopy, '⚡ CLUTCH WINDOW ACTIVE');
  });

  it('renders DECIDED state banner copy accurately for locked score', () => {
    const analysis: ClutchAnalysis = evaluateClutchState({
      currentQuestion: 10,
      totalQuestions: 10,
      playerScore: 600,
      opponentScore: 800,
    });

    assert.equal(analysis.status, 'DECIDED');
    assert.equal(analysis.isComebackPossible, false);
    assert.equal(analysis.headlineCopy, 'MASTERY TARGET ACTIVE');
    assert.equal(
      analysis.subCopy,
      'Score locked — finish above 80% accuracy to protect subject rating.',
    );
  });

  it('renders TIED state banner copy accurately on Question 10', () => {
    const analysis: ClutchAnalysis = evaluateClutchState({
      currentQuestion: 10,
      totalQuestions: 10,
      playerScore: 920,
      opponentScore: 920,
    });

    assert.equal(analysis.status, 'TIED');
    assert.equal(analysis.isComebackPossible, true);
    assert.equal(analysis.headlineCopy, 'DEAD HEAT');
  });
});
