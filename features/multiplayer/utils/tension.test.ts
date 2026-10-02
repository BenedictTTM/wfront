// features/multiplayer/utils/tension.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeCompetitiveState } from "./tension.ts";

describe("Competitive Tension System", () => {
  it("communicates YOU'RE AHEAD when player has higher score", () => {
    const state = computeCompetitiveState(250, 100, 3, "leading");
    assert.equal(state.leadStatus, "leading");
    assert.equal(state.statusType, "you_ahead");
    assert.equal(state.statusText, "YOU'RE AHEAD");
    assert.equal(state.isLeadChange, false);
    assert.equal(state.isCloseMatch, false);
  });

  it("detects YOU TOOK THE LEAD when transitioning from trailing/tied", () => {
    // Transition from trailing to leading
    const fromTrailing = computeCompetitiveState(220, 200, 3, "trailing");
    assert.equal(fromTrailing.leadStatus, "leading");
    assert.equal(fromTrailing.statusType, "you_took_lead");
    assert.equal(fromTrailing.statusText, "YOU TOOK THE LEAD");
    assert.equal(fromTrailing.isLeadChange, true);

    // Transition from tied to leading
    const fromTied = computeCompetitiveState(150, 100, 3, "tied");
    assert.equal(fromTied.leadStatus, "leading");
    assert.equal(fromTied.statusType, "you_took_lead");
    assert.equal(fromTied.statusText, "YOU TOOK THE LEAD");
    assert.equal(fromTied.isLeadChange, true);
  });

  it("communicates MATCH TIED when scores are equal", () => {
    const state = computeCompetitiveState(200, 200, 2, "leading");
    assert.equal(state.leadStatus, "tied");
    assert.equal(state.statusType, "match_tied");
    assert.equal(state.statusText, "MATCH TIED");
  });

  it("identifies COMEBACK WINDOW deterministically when deficit <= 200 and questions remain", () => {
    // Trailing by 120 points with 2 questions remaining: 1 round can flip lead (120 <= 200)
    const state = computeCompetitiveState(180, 300, 2, "trailing");
    assert.equal(state.leadStatus, "trailing");
    assert.equal(state.statusType, "comeback_window");
    assert.equal(state.statusText, "COMEBACK WINDOW");
    assert.equal(state.canComebackSingleQuestion, true);

    // Trailing by exactly 200 points
    const borderState = computeCompetitiveState(100, 300, 1, "trailing");
    assert.equal(borderState.statusType, "comeback_window");
    assert.equal(borderState.canComebackSingleQuestion, true);
  });

  it("does NOT show comeback window on final question when mathematically impossible in 1 round", () => {
    // Trailing by 250 points on the final question (1 question remaining, max 200 pts possible)
    const largeDeficit = computeCompetitiveState(100, 350, 1, "trailing");
    assert.equal(largeDeficit.leadStatus, "trailing");
    assert.equal(largeDeficit.statusType, "opponent_leads");
    assert.equal(largeDeficit.statusText, "OPPONENT IS LEADING");
    assert.equal(largeDeficit.canComebackSingleQuestion, false);
  });

  it("detects CLOSE MATCH tension when score gap is within 100 points", () => {
    // Gap of 40 points while leading
    const leadingClose = computeCompetitiveState(240, 200, 3, "leading");
    assert.equal(leadingClose.isCloseMatch, true);
    assert.equal(leadingClose.statusText, "YOU'RE AHEAD (CLOSE)");

    // Gap of 250 points while leading
    const leadingFar = computeCompetitiveState(450, 200, 3, "leading");
    assert.equal(leadingFar.isCloseMatch, false);
    assert.equal(leadingFar.statusText, "YOU'RE AHEAD");
  });
});
