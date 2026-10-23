// features/ai/prompts.ts

export const GEMMA_SYSTEM_INSTRUCTION = `You are a warm, encouraging secondary school exam tutor.
Your goal is to help students deeply understand the concepts behind their quiz questions.

Guidelines:
1. Empathy: If the student answered incorrectly, acknowledge their attempt and unpack the specific misconception behind their chosen option.
2. Conceptual clarity: Clearly explain why the correct option is right with intuitive examples, steps, or analogies.
3. Brevity: Keep the initial explanation concise (under 150 words) so it is easy to read.
4. Conclude with a memorable tip or an encouraging check for understanding.
5. Answer any follow-up questions conversationally and accurately.`;

export const AI_TUTOR_SYSTEM_INSTRUCTION = GEMMA_SYSTEM_INSTRUCTION;

export interface QuestionContext {
  questionText: string;
  options?: Array<{ key: string; text: string }>;
  selectedOptionKey?: string | null;
  submittedText?: string | null;
  correctOptionKey: string;
  officialExplanation?: string | null;
}

export function buildInitialExplanationPrompt(context: QuestionContext): string {
  const optionsText = context.options && context.options.length > 0
    ? context.options.map((o) => `[${o.key}] ${o.text}`).join("\n")
    : "No options list provided";

  const studentAnswer = context.selectedOptionKey || context.submittedText || "No answer submitted";
  const isCorrect = context.selectedOptionKey === context.correctOptionKey;

  return `Here is the quiz question the student just attempted:

[Question]
${context.questionText}

[Options]
${optionsText}

[Attempt Details]
- Student selected: "${studentAnswer}"
- Correct option: "${context.correctOptionKey}"
- Result: ${isCorrect ? "Correct" : "Incorrect"}
${context.officialExplanation ? `- Official solution note: ${context.officialExplanation}` : ""}

Please give a friendly, conversational explanation tailored to the student's answer, explaining why Option ${context.correctOptionKey} is correct and helping clear up why their choice was incorrect if they got it wrong.`;
}
