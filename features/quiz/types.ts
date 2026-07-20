// features/quiz — quiz attempt creation, answering, results
// TODO: implement against confirmed endpoint shapes
export type QuizAttempt = {
  id: string;
  status: "in_progress" | "completed";
  // TODO: confirm full shape
};
export type QuizAnswer = { questionId: string; selectedOption: string; /* TODO */ };
