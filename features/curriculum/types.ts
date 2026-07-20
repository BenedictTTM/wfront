// features/curriculum — subjects, topics, subtopics, PDF reader
// TODO: implement against confirmed endpoint shapes
export type Subject = { id: string; name: string; /* TODO */ };
export type Topic = { id: string; subjectId: string; name: string; /* TODO */ };
export type Subtopic = { id: string; topicId: string; name: string; /* TODO */ };
export type Pdf = { id: string; status: "processing" | "published" | "processing_failed"; /* TODO */ };
