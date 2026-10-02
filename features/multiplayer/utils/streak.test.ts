// features/multiplayer/utils/streak.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createInitialStreakState,
  recordStreakAnswer,
  resetStreakState,
  getStreakTier,
} from "./streak.ts";

describe("Streak / Combo System", () => {
  it("correct → streak increments", () => {
    let state = createInitialStreakState();
    assert.equal(state.currentStreak, 0);
    assert.equal(state.bestStreak, 0);

    // 1st correct answer
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 1);
    assert.equal(state.bestStreak, 1);

    // 2nd correct answer
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 2);
    assert.equal(state.bestStreak, 2);

    // 3rd correct answer
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 3);
    assert.equal(state.bestStreak, 3);

    // 4th correct answer
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 4);
    assert.equal(state.bestStreak, 4);
  });

  it("incorrect → streak resets", () => {
    let state = createInitialStreakState();

    // Build streak to 3
    state = recordStreakAnswer(state, true);
    state = recordStreakAnswer(state, true);
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 3);
    assert.equal(state.bestStreak, 3);

    // Incorrect answer resets current streak to 0, bestStreak preserved
    state = recordStreakAnswer(state, false);
    assert.equal(state.currentStreak, 0);
    assert.equal(state.bestStreak, 3);

    // Subsequent correct answer starts new streak from 1
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 1);
    assert.equal(state.bestStreak, 3); // bestStreak still 3

    // Reach 4 (exceeding previous best)
    state = recordStreakAnswer(state, true);
    state = recordStreakAnswer(state, true);
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 4);
    assert.equal(state.bestStreak, 4); // updated to 4
  });

  it("next match → streak resets", () => {
    let state = createInitialStreakState();
    state = recordStreakAnswer(state, true);
    state = recordStreakAnswer(state, true);
    state = recordStreakAnswer(state, true);
    assert.equal(state.currentStreak, 3);
    assert.equal(state.bestStreak, 3);

    // Resetting for next match clears both current and best streak
    state = resetStreakState();
    assert.equal(state.currentStreak, 0);
    assert.equal(state.bestStreak, 0);
  });

  it("correctly maps streak tiers", () => {
    assert.equal(getStreakTier(0), "none");
    assert.equal(getStreakTier(1), "none"); // 1 correct: no major celebration
    assert.equal(getStreakTier(2), "subtle"); // 2: subtle indicator
    assert.equal(getStreakTier(3), "streak3"); // 3: 🔥 3 STREAK
    assert.equal(getStreakTier(4), "streak3"); // 4: 🔥 4 STREAK
    assert.equal(getStreakTier(5), "streak5"); // 5+: 🔥 5 STREAK (more prominent)
    assert.equal(getStreakTier(10), "streak5");
  });
});
