// features/questions — question authoring (Teacher) and review workflow (Admin)
// TODO: implement
export type Question = {
  id: string;
  status: "draft" | "pending_review" | "published" | "rejected";
  authorId: string;
  // TODO: confirm full shape (options, correct answer format, etc.)
};
