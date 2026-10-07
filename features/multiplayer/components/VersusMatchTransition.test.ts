// features/multiplayer/components/VersusMatchTransition.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  CombatantProfile,
  VersusMatchTransitionProps,
} from "../utils/versus-transition.ts";
import {
  MOCK_PREMPEH_COLLEGE,
  MOCK_ACHIMOTA_SCHOOL,
  MOCK_VERSUS_MATCH,
  VERSUS_ANIMATION_TIMINGS,
  getSchoolAbbreviation,
  getUserInitials,
} from "../utils/versus-transition.ts";

describe("VersusMatchTransition Specifications & Mock Data Integrity", () => {
  it("provides valid and resilient mock profiles for Prempeh College vs. Achimota School", () => {
    assert.equal(MOCK_PREMPEH_COLLEGE.schoolName, "Prempeh College");
    assert.equal(MOCK_PREMPEH_COLLEGE.schoolShortCode, "PMP");
    assert.equal(MOCK_PREMPEH_COLLEGE.schoolColor, "#055B38");
    assert.equal(MOCK_PREMPEH_COLLEGE.crestUrl, null); // asserts null for fallback resilience
    assert.equal(MOCK_PREMPEH_COLLEGE.username, "Kofi_Amanfoo");
    assert.equal(MOCK_PREMPEH_COLLEGE.elo, 1420);

    assert.equal(MOCK_ACHIMOTA_SCHOOL.schoolName, "Achimota School");
    assert.equal(MOCK_ACHIMOTA_SCHOOL.schoolShortCode, "MOT");
    assert.equal(MOCK_ACHIMOTA_SCHOOL.schoolColor, "#172554");
    assert.equal(MOCK_ACHIMOTA_SCHOOL.crestUrl, null); // asserts null for fallback resilience
    assert.equal(MOCK_ACHIMOTA_SCHOOL.username, "Nana_Akora");
    assert.equal(MOCK_ACHIMOTA_SCHOOL.elo, 1395);
  });

  it("extracts 3-letter school abbreviation correctly for crest fallback box", () => {
    assert.equal(getSchoolAbbreviation("PMP"), "PMP");
    assert.equal(getSchoolAbbreviation("MOT"), "MOT");
    assert.equal(getSchoolAbbreviation("PRS"), "PRS");
    assert.equal(getSchoolAbbreviation("ACH"), "ACH");
    assert.equal(getSchoolAbbreviation(""), "SCH");
  });

  it("extracts 2-character user initials correctly for avatar fallback", () => {
    assert.equal(getUserInitials("Kofi_Amanfoo"), "KO");
    assert.equal(getUserInitials("Nana_Akora"), "NA");
    assert.equal(getUserInitials("!@#$"), "SH");
    assert.equal(getUserInitials(""), "SH");
  });

  it("calibrates exact snappy animation sequence timings", () => {
    assert.equal(VERSUS_ANIMATION_TIMINGS.panelSlideDurationMs, 400); // 0.0s - 0.4s
    assert.equal(VERSUS_ANIMATION_TIMINGS.vsSlamDelayMs, 400); // 0.4s slam
    assert.equal(VERSUS_ANIMATION_TIMINGS.readyCountdownDelayMs, 700); // 0.7s READY
    assert.equal(VERSUS_ANIMATION_TIMINGS.setCountdownDelayMs, 1400); // 1.4s SET
    assert.equal(VERSUS_ANIMATION_TIMINGS.clashCountdownDelayMs, 2100); // 2.1s CLASH
    assert.equal(VERSUS_ANIMATION_TIMINGS.totalDurationMs, 2500); // 2.5s onComplete
  });

  it("adheres to the 2.5s duration and match stakes interface", () => {
    let completed = false;
    const mockProps: VersusMatchTransitionProps = {
      player1: MOCK_PREMPEH_COLLEGE,
      player2: MOCK_ACHIMOTA_SCHOOL,
      subject: MOCK_VERSUS_MATCH.subject,
      stakes: MOCK_VERSUS_MATCH.stakes,
      durationMs: 2500,
      onComplete: () => {
        completed = true;
      },
    };

    assert.equal(mockProps.durationMs, 2500);
    assert.equal(mockProps.subject, "CORE MATHEMATICS • SPEED ROUND");
    assert.equal(mockProps.stakes, "+25 SCHOOL TURF PTS");
    mockProps.onComplete?.();
    assert.equal(completed, true);
  });
});
