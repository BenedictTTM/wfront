// features/multiplayer/utils/match-results.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeMatchOutcome,
  computePerformanceStats,
} from "./match-results.ts";

describe("Match Results & Performance Statistics", () => {
  it("evaluates a WIN correctly", () => {
    const outcome = computeMatchOutcome(1240, 1120, "Alex");
    assert.equal(outcome.outcome, "win");
    assert.equal(outcome.headline, "VICTORY");
    assert.equal(outcome.badgeText, "YOU WON");
    assert.equal(outcome.myScore, 1240);
    assert.equal(outcome.opponentScore, 1120);
    assert.equal(outcome.scoreDiff, 120);
    assert.match(outcome.summaryText, /won the match by \+120 points/);
  });

  it("evaluates a LOSS correctly", () => {
    const outcome = computeMatchOutcome(950, 1150, "Jordan");
    assert.equal(outcome.outcome, "loss");
    assert.equal(outcome.headline, "DEFEAT");
    assert.equal(outcome.badgeText, "OPPONENT WON");
    assert.equal(outcome.myScore, 950);
    assert.equal(outcome.opponentScore, 1150);
    assert.equal(outcome.scoreDiff, 200);
    assert.match(outcome.summaryText, /Jordan took the win by 200 points/);
  });

  it("evaluates a DRAW correctly when scores are tied", () => {
    const outcome = computeMatchOutcome(1000, 1000, "Taylor");
    assert.equal(outcome.outcome, "draw");
    assert.equal(outcome.headline, "DRAW");
    assert.equal(outcome.badgeText, "MATCH TIED");
    assert.equal(outcome.scoreDiff, 0);
    assert.match(outcome.summaryText, /draw at 1,000 points each/);
  });

  it("computes accuracy and performance stats accurately", () => {
    const stats = computePerformanceStats(8, 2, 10, 5);
    assert.equal(stats.correctCount, 8);
    assert.equal(stats.incorrectCount, 2);
    assert.equal(stats.questionsCompleted, 10);
    assert.equal(stats.totalQuestions, 10);
    assert.equal(stats.accuracy, 80);
    assert.equal(stats.bestStreak, 5);
  });

  it("handles 0 completed questions safely without dividing by zero", () => {
    const stats = computePerformanceStats(0, 0, 10, 0);
    assert.equal(stats.correctCount, 0);
    assert.equal(stats.incorrectCount, 0);
    assert.equal(stats.questionsCompleted, 0);
    assert.equal(stats.totalQuestions, 10);
    assert.equal(stats.accuracy, 0);
    assert.equal(stats.bestStreak, 0);
  });
});
