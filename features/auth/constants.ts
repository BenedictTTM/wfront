// features/auth/constants.ts — academic constants and profile configuration

export const ACADEMIC_TRACKS = [
  "General Science Track",
  "General Arts Track",
  "Business Track",
  "Visual Arts Track",
  "Home Economics Track",
  "Agricultural Science Track",
  "Technical Track",
];

export interface CustomProfileState {
  name: string;
  school: string;
  schoolId?: string | null;
  schoolCrestUrl?: string | null;
  schoolRegion?: string | null;
  schoolShortCode?: string | null;
  track: string;
  avatarUrl?: string | null;
}
