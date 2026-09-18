// features/questions — question authoring (Teacher) and review workflow (Admin)

import type { QuestionOption } from "@/features/quiz/types";

export type QuestionStatus = "draft" | "pending_review" | "published" | "rejected";

export type Question = {
  id: string;
  status: QuestionStatus;
  authorId: string;
  text?: string;
  topicId?: string;
  difficulty?: string;
  options?: QuestionOption[];
};

export type CreateQuestionPayload = {
  text: string;
  topicId: string;
  difficulty: string;
  options: QuestionOption[];
  correctOption: string;
  explanation?: string;
};

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;
