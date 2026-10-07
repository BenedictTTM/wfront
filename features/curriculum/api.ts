import { apiGet } from "@/lib/api-client";
import { Subject } from "./types";

export async function getSubjects(): Promise<Subject[]> {
  return apiGet<Subject[]>("/subjects");
}


