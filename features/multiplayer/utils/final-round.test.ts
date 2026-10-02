// features/multiplayer/utils/final-round.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getFinalRoundStage,
  computeFinalRoundInfo,
} from "./final-round.ts";

describe("Final Round Progression System", () => {
  it("progresses correctly across a 10-question match", () => {
    const total = 10;

    // Questions 1 to 7 (indices 0 to 6) are normal
    for (let idx = 0; idx <= 6; idx++) {
      assert.equal(getFinalRoundStage(idx, total), "normal");
      const info = computeFinalRoundInfo(idx, total);
      assert.equal(info.isFinalStretch, false);
      assert.equal(info.isFinalQuestion, false);
      assert.equal(info.badgeText, "");
    }

    // Question 8 (index 7): 3 questions remaining (Q8, Q9, Q10) -> FINAL 3
    assert.equal(getFinalRoundStage(7, total), "final_3");
    const f3Info = computeFinalRoundInfo(7, total);
    assert.equal(f3Info.stage, "final_3");
    assert.equal(f3Info.badgeText, "FINAL 3");
    assert.equal(f3Info.isFinalStretch, true);
    assert.equal(f3Info.isFinalQuestion, false);

    // Question 9 (index 8): 2 questions remaining (Q9, Q10) -> FINAL 2
    assert.equal(getFinalRoundStage(8, total), "final_2");
    const f2Info = computeFinalRoundInfo(8, total);
    assert.equal(f2Info.stage, "final_2");
    assert.equal(f2Info.badgeText, "FINAL 2");
    assert.equal(f2Info.isFinalStretch, true);
    assert.equal(f2Info.isFinalQuestion, false);

    // Question 10 (index 9): 1 question remaining (Q10) -> FINAL QUESTION
    assert.equal(getFinalRoundStage(9, total), "final_question");
    const finalInfo = computeFinalRoundInfo(9, total);
    assert.equal(finalInfo.stage, "final_question");
    assert.equal(finalInfo.badgeText, "FINAL QUESTION");
    assert.equal(finalInfo.isFinalStretch, true);
    assert.equal(finalInfo.isFinalQuestion, true);
    assert.equal(finalInfo.stageTagline, "Deciding Question");
  });

  it("handles short matches gracefully (3 questions)", () => {
    const total = 3;
    assert.equal(getFinalRoundStage(0, total), "final_3");
    assert.equal(getFinalRoundStage(1, total), "final_2");
    assert.equal(getFinalRoundStage(2, total), "final_question");
  });

  it("handles 1-question match gracefully", () => {
    assert.equal(getFinalRoundStage(0, 1), "final_question");
  });

  it("handles boundary/invalid conditions safely without throwing", () => {
    assert.equal(getFinalRoundStage(0, 0), "normal");
    assert.equal(getFinalRoundStage(-1, 5), "normal");
    assert.equal(getFinalRoundStage(5, 5), "normal");
    assert.equal(getFinalRoundStage(10, 5), "normal");

    const zeroInfo = computeFinalRoundInfo(0, 0);
    assert.equal(zeroInfo.stage, "normal");
    assert.equal(zeroInfo.questionsLeft, 0);
  });
});
