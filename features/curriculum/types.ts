// features/curriculum/types.ts — subjects, topics, subtopics types

export type Subject = {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string;
  createdAt: string;
};

export type Topic = {
  id: string;
  name: string;
  slug: string;
  subjectId: string;
  createdAt: string;
};

export type Subtopic = {
  id: string;
  name: string;
  slug: string;
  topicId: string;
  createdAt: string;
};

export type SubjectDetails = Subject & {
  topics: (Topic & { subtopics?: Subtopic[] })[];
};

export type Pdf = {
  id: string;
  status: "processing" | "published" | "processing_failed";
};

