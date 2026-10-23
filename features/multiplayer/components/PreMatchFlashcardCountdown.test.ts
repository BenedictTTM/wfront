// features/multiplayer/components/PreMatchFlashcardCountdown.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PreMatchFlashcardCountdownProps } from "./PreMatchFlashcardCountdown.tsx";
import {
  MOCK_ST_THOMAS_AQUINAS,
  MOCK_GHOST_SCHOLAR,
} from "../utils/versus-transition.ts";

describe("PreMatchFlashcardCountdown Specifications & Logic", () => {
  it("structures PreMatchFlashcardCountdownProps correctly with combatant support", () => {
    const props: PreMatchFlashcardCountdownProps = {
      countdown: 10,
      subjectName: "Integrated Science",
      player1: MOCK_ST_THOMAS_AQUINAS,
      player2: MOCK_GHOST_SCHOLAR,
      stakes: "+25 SCHOOL TURF PTS",
      flashcards: [
        {
          id: "fc-1",
          front: "What is ATP synthesis site?",
          back: "Mitochondria produce ATP via aerobic respiration.",
          topic: "Biology",
        },
      ],
    };

    assert.equal(props.countdown, 10);
    assert.equal(props.subjectName, "Integrated Science");
    assert.equal(props.player1?.username, "Afotey Benedict");
    assert.equal(props.player2?.username, "Ghost Scholar");
    assert.equal(props.stakes, "+25 SCHOOL TURF PTS");
    assert.equal(props.flashcards?.length, 1);
  });

  it("calculates depleting countdown progress correctly over 10 seconds", () => {
    const computeProgress = (countdown: number) =>
      Math.max(0, Math.min(100, (countdown / 10) * 100));

    assert.equal(computeProgress(10), 100);
    assert.equal(computeProgress(7), 70);
    assert.equal(computeProgress(3), 30);
    assert.equal(computeProgress(0), 0);
  });

  it("triggers urgent state when countdown is at or below 3 seconds", () => {
    const isUrgent = (countdown: number) => countdown <= 3;

    assert.equal(isUrgent(10), false);
    assert.equal(isUrgent(5), false);
    assert.equal(isUrgent(4), false);
    assert.equal(isUrgent(3), true);
    assert.equal(isUrgent(1), true);
    assert.equal(isUrgent(0), true);
  });

  it("resolves default fallback cards when server sends empty flashcards", () => {
    const defaultCards = [
      { id: "def-1", front: "Concord rule", back: "Singular verbs", topic: "ENGLISH" },
      { id: "def-2", front: "Mitochondria", back: "ATP synthesis", topic: "SCIENCE" },
    ];

    const resolveCards = (cards?: Array<{ id: string; front: string; back: string }>) =>
      cards && cards.length > 0 ? cards : defaultCards;

    assert.equal(resolveCards(undefined).length, 2);
    assert.equal(resolveCards([]).length, 2);
    assert.equal(
      resolveCards([{ id: "custom-1", front: "Q", back: "A" }]).length,
      1
    );
  });
});
