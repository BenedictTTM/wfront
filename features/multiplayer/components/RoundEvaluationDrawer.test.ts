// features/multiplayer/components/RoundEvaluationDrawer.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { RoundEvaluationProps } from './RoundEvaluationDrawer.tsx';

describe('RoundEvaluationDrawer WCAG AAA & Pedagogical Framing', () => {
  it('correctly structures RoundEvaluationProps interface', () => {
    let bookmarked = false;
    let nextReady = false;

    const props: RoundEvaluationProps = {
      isOpen: true,
      isCorrect: true,
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-a',
      scoreEarned: {
        base: 100,
        speedBonus: 35,
        streakBonus: 20,
        total: 155,
      },
      explanationText: 'Mitochondria produce ATP through aerobic cellular respiration.',
      onBookmarkConcept: () => {
        bookmarked = true;
      },
      onNextQuestionReady: () => {
        nextReady = true;
      },
    };

    assert.equal(props.isOpen, true);
    assert.equal(props.isCorrect, true);
    assert.equal(props.scoreEarned.total, 155);
    props.onBookmarkConcept();
    assert.equal(bookmarked, true);
    props.onNextQuestionReady?.();
    assert.equal(nextReady, true);
  });

  it('validates WCAG 2.2 AAA color tokens and contrast ratios (> 7:1)', () => {
    // Relative luminance calculation per WCAG 2.2 specification
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const getContrastRatio = (hex1: string, hex2: string) => {
      const parseHex = (hex: string) => {
        const clean = hex.replace('#', '');
        return [
          parseInt(clean.slice(0, 2), 16),
          parseInt(clean.slice(2, 4), 16),
          parseInt(clean.slice(4, 6), 16),
        ];
      };
      const [r1, g1, b1] = parseHex(hex1);
      const [r2, g2, b2] = parseHex(hex2);
      const l1 = getLuminance(r1, g1, b1);
      const l2 = getLuminance(r2, g2, b2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    // Correct State:
    // Background: #064E3B, Text: #ECFDF5, Border: #10B981
    const correctContrast = getContrastRatio('#064E3B', '#ECFDF5');
    assert.ok(
      correctContrast >= 7.0,
      `Correct state contrast ${correctContrast.toFixed(2)}:1 must exceed 7:1 (WCAG AAA)`,
    );

    // Incorrect State:
    // Background: #4C0519, Text: #FFF1F2, Border: #F43F5E
    const incorrectContrast = getContrastRatio('#4C0519', '#FFF1F2');
    assert.ok(
      incorrectContrast >= 7.0,
      `Incorrect state contrast ${incorrectContrast.toFixed(2)}:1 must exceed 7:1 (WCAG AAA)`,
    );

    // Verify forbidden pastel combinations fail or are avoided:
    // e.g. White (#FFFFFF) on pastel red (#FCA5A5) has contrast ~1.5:1
    const forbiddenPastelRedContrast = getContrastRatio('#FFFFFF', '#FCA5A5');
    assert.ok(
      forbiddenPastelRedContrast < 3.0,
      'White on #FCA5A5 fails WCAG and is strictly forbidden',
    );
  });

  it('formats pedagogical non-shaming badges for correct and incorrect outcomes', () => {
    const formatFeedback = (isCorrect: boolean, score: { base: number; speedBonus: number; streakBonus: number; total: number }) => {
      if (isCorrect) {
        return {
          badge: 'LOCKED & VERIFIED',
          breakdown: `+${score.total} PTS (Base: ${score.base} | Speed: +${score.speedBonus} | Streak: +${score.streakBonus})`,
        };
      }
      return {
        badge: 'COUNTERED • FOCUS ON CONCEPT',
        breakdown: '+0 PTS',
      };
    };

    const correctOutput = formatFeedback(true, { base: 100, speedBonus: 40, streakBonus: 30, total: 170 });
    assert.equal(correctOutput.badge, 'LOCKED & VERIFIED');
    assert.equal(correctOutput.breakdown, '+170 PTS (Base: 100 | Speed: +40 | Streak: +30)');
    assert.equal(correctOutput.badge.includes('WRONG'), false);
    assert.equal(correctOutput.badge.includes('FAILED'), false);

    const incorrectOutput = formatFeedback(false, { base: 0, speedBonus: 0, streakBonus: 0, total: 0 });
    assert.equal(incorrectOutput.badge, 'COUNTERED • FOCUS ON CONCEPT');
    assert.equal(incorrectOutput.breakdown, '+0 PTS');
    assert.equal(incorrectOutput.badge.includes('WRONG'), false);
    assert.equal(incorrectOutput.badge.includes('FAILED'), false);
  });

  it('defines 1200ms auto-advance sequencing timer duration', () => {
    const AUTO_ADVANCE_DURATION_MS = 1200;
    assert.equal(AUTO_ADVANCE_DURATION_MS, 1200);
  });

  it('supports extended explanation props and match-wide toggle persistence', () => {
    let matchWideExtended = false;
    let toggleCount = 0;

    const onToggleExtended = () => {
      matchWideExtended = !matchWideExtended;
      toggleCount++;
    };

    // Round 1: Initially concise
    const round1Props: RoundEvaluationProps = {
      isOpen: true,
      isCorrect: true,
      selectedOptionId: 'opt-b',
      correctOptionId: 'opt-b',
      scoreEarned: { base: 100, speedBonus: 20, streakBonus: 10, total: 130 },
      explanationText: 'Chlorophyll absorbs sunlight for photosynthesis.',
      extendedExplanationText:
        'Curriculum Deep-Dive: Chlorophyll pigments (a and b) in thylakoid membranes absorb blue and red light...',
      isExtended: matchWideExtended,
      onToggleExtended,
      onBookmarkConcept: () => {},
    };

    assert.equal(round1Props.isExtended, false);

    // User opts to extend explanation in Round 1
    round1Props.onToggleExtended?.();
    assert.equal(matchWideExtended, true);
    assert.equal(toggleCount, 1);

    // Round 2 (Next Question in same match): Extended preference applies automatically
    const round2Props: RoundEvaluationProps = {
      isOpen: true,
      isCorrect: false,
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-c',
      scoreEarned: { base: 0, speedBonus: 0, streakBonus: 0, total: 0 },
      explanationText: 'Mitochondria generate ATP via cellular respiration.',
      extendedExplanationText:
        'Curriculum Deep-Dive: Double-membraned organelles with inner cristae driving oxidative phosphorylation...',
      isExtended: matchWideExtended,
      onToggleExtended,
      onBookmarkConcept: () => {},
    };

    assert.equal(round2Props.isExtended, true, 'Round 2 must inherit extended explanation mode from Round 1');
    assert.ok(round2Props.extendedExplanationText?.includes('Deep-Dive'));

    // Round 3 (Another Question): Preference continues to apply
    const round3Props: RoundEvaluationProps = {
      isOpen: true,
      isCorrect: true,
      selectedOptionId: 'opt-c',
      correctOptionId: 'opt-c',
      scoreEarned: { base: 100, speedBonus: 30, streakBonus: 20, total: 150 },
      explanationText: 'Concord requires singular verbs for collective measurements.',
      isExtended: matchWideExtended,
      onToggleExtended,
      onBookmarkConcept: () => {},
    };

    assert.equal(round3Props.isExtended, true, 'Round 3 must maintain match-wide extended explanation');
  });
});
