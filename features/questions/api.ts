// features/questions/api — question CRUD and review workflow calls
// Requires content:create (Teacher), content:publish (Admin)
// TODO: implement
export async function getMyQuestions(): Promise<void> { /* TODO: cursor-paginated */ }
export async function getQuestion(_questionId: string): Promise<void> { /* TODO */ }
export async function createQuestion(_data: unknown): Promise<void> { /* TODO */ }
export async function updateQuestion(_questionId: string, _data: unknown): Promise<void> { /* TODO */ }
export async function submitQuestionForReview(_questionId: string): Promise<void> { /* TODO */ }
export async function approveQuestion(_questionId: string): Promise<void> { /* TODO: content:publish */ }
export async function rejectQuestion(_questionId: string, _reason: string): Promise<void> { /* TODO: content:publish */ }
export async function getReviewQueue(): Promise<void> { /* TODO: Admin only, cursor-paginated */ }
